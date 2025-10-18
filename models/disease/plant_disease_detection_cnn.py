"""
Plant Disease Detection CNN Model with PyTorch
This model uses Convolutional Neural Networks to classify plant diseases from leaf images.
Uses PyTorch with CUDA GPU acceleration for NVIDIA GTX 1650.
"""

import os
import numpy as np
# Set matplotlib config dir to avoid permission issues
os.environ['MPLCONFIGDIR'] = '/tmp/matplotlib'
if not os.path.exists('/tmp/matplotlib'):
    os.makedirs('/tmp/matplotlib', exist_ok=True)
import matplotlib.pyplot as plt
from PIL import Image
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
from tqdm import tqdm
import json
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# Configure PyTorch for GPU (silent check)
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
if torch.cuda.is_available():
    # Enable cudnn benchmarking for faster training
    torch.backends.cudnn.benchmark = True


class PlantDiseaseDetectionModel:
    """
    Plant Disease Detection using Transfer Learning with MobileNetV2
    Optimized for GPU training on NVIDIA GTX 1650
    """
    
    def __init__(self, data_dir='data/PlantVillage', img_size=224, batch_size=32):
        """
        Initialize the model
        
        Args:
            data_dir: Path to the PlantVillage dataset
            img_size: Image size for input (default: 224x224)
            batch_size: Batch size for training (default: 32)
        """
        self.data_dir = data_dir
        self.img_size = img_size
        self.batch_size = batch_size
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = None
        self.train_loader = None
        self.val_loader = None
        self.class_names = []
        self.history = {'train_loss': [], 'train_acc': [], 'val_loss': [], 'val_acc': []}
        
    def prepare_data(self, train_split=0.8):
        """
        Prepare data loaders with augmentation for training and validation
        
        Args:
            train_split: Proportion of data for training (default: 0.8)
        """
        print("\n" + "="*70)
        print("PREPARING DATA")
        print("="*70)
        
        # Data augmentation for training
        train_transform = transforms.Compose([
            transforms.Resize((self.img_size, self.img_size)),
            transforms.RandomRotation(20),
            transforms.RandomHorizontalFlip(),
            transforms.RandomAffine(degrees=0, translate=(0.2, 0.2), shear=0.2),
            transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        
        # Validation transform (no augmentation)
        val_transform = transforms.Compose([
            transforms.Resize((self.img_size, self.img_size)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        
        # Load full dataset
        full_dataset = datasets.ImageFolder(root=self.data_dir)
        self.class_names = full_dataset.classes
        
        # Split into train and validation
        train_size = int(train_split * len(full_dataset))
        val_size = len(full_dataset) - train_size
        train_dataset, val_dataset = torch.utils.data.random_split(
            full_dataset, [train_size, val_size]
        )
        
        # Apply transforms
        train_dataset.dataset.transform = train_transform
        val_dataset.dataset.transform = val_transform
        
        # Create data loaders
        self.train_loader = DataLoader(
            train_dataset,
            batch_size=self.batch_size,
            shuffle=True,
            num_workers=4,
            pin_memory=True if torch.cuda.is_available() else False
        )
        
        self.val_loader = DataLoader(
            val_dataset,
            batch_size=self.batch_size,
            shuffle=False,
            num_workers=4,
            pin_memory=True if torch.cuda.is_available() else False
        )
        
        print(f"✓ Total images: {len(full_dataset)}")
        print(f"✓ Training images: {train_size}")
        print(f"✓ Validation images: {val_size}")
        print(f"✓ Number of classes: {len(self.class_names)}")
        print(f"✓ Image size: {self.img_size}x{self.img_size}")
        print(f"✓ Batch size: {self.batch_size}")
        print(f"\nClasses: {', '.join(self.class_names)}")
        print("="*70 + "\n")
        
    def build_model(self):
        """
        Build MobileNetV2 model with transfer learning
        """
        # Load pre-trained MobileNetV2
        mobilenet = models.mobilenet_v2(pretrained=True)
        
        # Freeze early layers
        for param in mobilenet.features.parameters():
            param.requires_grad = False
        
        # Replace classifier
        num_classes = len(self.class_names)
        mobilenet.classifier = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(mobilenet.last_channel, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Linear(256, num_classes)
        )
        
        self.model = mobilenet.to(self.device)
        
    def train(self, epochs=50, learning_rate=0.001, patience=10):
        """
        Train the model with GPU acceleration
        
        Args:
            epochs: Number of training epochs
            learning_rate: Learning rate for optimizer
            patience: Early stopping patience
        """
        if self.model is None:
            raise ValueError("Model not built. Call build_model() first.")
        
        print("\n" + "="*70)
        print("TRAINING MODEL")
        print("="*70)
        print(f"Epochs: {epochs}")
        print(f"Learning rate: {learning_rate}")
        print(f"Early stopping patience: {patience}")
        print(f"Device: {self.device}")
        print("="*70 + "\n")
        
        # Loss function and optimizer
        criterion = nn.CrossEntropyLoss()
        optimizer = optim.Adam(self.model.parameters(), lr=learning_rate)
        
        # Learning rate scheduler
        scheduler = optim.lr_scheduler.ReduceLROnPlateau(
            optimizer, mode='min', factor=0.5, patience=3, verbose=True
        )
        
        # Early stopping variables
        best_val_loss = float('inf')
        patience_counter = 0
        best_model_path = 'models/best_plant_disease_model.pth'
        
        # Training loop
        for epoch in range(epochs):
            print(f"\nEpoch {epoch+1}/{epochs}")
            print("-" * 70)
            
            # Training phase
            self.model.train()
            train_loss = 0.0
            train_correct = 0
            train_total = 0
            
            train_pbar = tqdm(self.train_loader, desc='Training', leave=False)
            for inputs, labels in train_pbar:
                inputs, labels = inputs.to(self.device), labels.to(self.device)
                
                optimizer.zero_grad()
                outputs = self.model(inputs)
                loss = criterion(outputs, labels)
                loss.backward()
                optimizer.step()
                
                train_loss += loss.item()
                _, predicted = outputs.max(1)
                train_total += labels.size(0)
                train_correct += predicted.eq(labels).sum().item()
                
                train_pbar.set_postfix({
                    'loss': f'{loss.item():.4f}',
                    'acc': f'{100.*train_correct/train_total:.2f}%'
                })
            
            train_loss /= len(self.train_loader)
            train_acc = 100. * train_correct / train_total
            
            # Validation phase
            self.model.eval()
            val_loss = 0.0
            val_correct = 0
            val_total = 0
            
            with torch.no_grad():
                val_pbar = tqdm(self.val_loader, desc='Validation', leave=False)
                for inputs, labels in val_pbar:
                    inputs, labels = inputs.to(self.device), labels.to(self.device)
                    
                    outputs = self.model(inputs)
                    loss = criterion(outputs, labels)
                    
                    val_loss += loss.item()
                    _, predicted = outputs.max(1)
                    val_total += labels.size(0)
                    val_correct += predicted.eq(labels).sum().item()
                    
                    val_pbar.set_postfix({
                        'loss': f'{loss.item():.4f}',
                        'acc': f'{100.*val_correct/val_total:.2f}%'
                    })
            
            val_loss /= len(self.val_loader)
            val_acc = 100. * val_correct / val_total
            
            # Update history
            self.history['train_loss'].append(train_loss)
            self.history['train_acc'].append(train_acc)
            self.history['val_loss'].append(val_loss)
            self.history['val_acc'].append(val_acc)
            
            # Print epoch results
            print(f"Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.2f}%")
            print(f"Val Loss: {val_loss:.4f} | Val Acc: {val_acc:.2f}%")
            
            # Learning rate scheduler
            scheduler.step(val_loss)
            
            # Early stopping and model checkpointing
            if val_loss < best_val_loss:
                best_val_loss = val_loss
                patience_counter = 0
                torch.save({
                    'epoch': epoch,
                    'model_state_dict': self.model.state_dict(),
                    'optimizer_state_dict': optimizer.state_dict(),
                    'val_loss': val_loss,
                    'val_acc': val_acc,
                    'class_names': self.class_names
                }, best_model_path)
                print(f"✓ Model saved (best validation loss: {val_loss:.4f})")
            else:
                patience_counter += 1
                print(f"⚠ No improvement ({patience_counter}/{patience})")
                
                if patience_counter >= patience:
                    print(f"\n⚠ Early stopping triggered after {epoch+1} epochs")
                    break
        
        print("\n" + "="*70)
        print("TRAINING COMPLETED")
        print("="*70)
        print(f"✓ Best validation loss: {best_val_loss:.4f}")
        print(f"✓ Model saved to: {best_model_path}")
        print("="*70 + "\n")
        
        # Load best model
        checkpoint = torch.load(best_model_path)
        self.model.load_state_dict(checkpoint['model_state_dict'])
        
    def evaluate(self):
        """
        Evaluate the model on validation set
        """
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        print("\n" + "="*70)
        print("EVALUATING MODEL")
        print("="*70)
        
        self.model.eval()
        all_preds = []
        all_labels = []
        
        with torch.no_grad():
            for inputs, labels in tqdm(self.val_loader, desc='Evaluating'):
                inputs = inputs.to(self.device)
                outputs = self.model(inputs)
                _, predicted = outputs.max(1)
                
                all_preds.extend(predicted.cpu().numpy())
                all_labels.extend(labels.numpy())
        
        # Calculate accuracy
        accuracy = 100. * sum(np.array(all_preds) == np.array(all_labels)) / len(all_labels)
        print(f"\n✓ Validation Accuracy: {accuracy:.2f}%")
        
        # Classification report
        from sklearn.metrics import classification_report
        print("\nClassification Report:")
        print(classification_report(all_labels, all_preds, target_names=self.class_names, zero_division=0))
        
        print("="*70 + "\n")
        
        return accuracy
        
    def plot_training_history(self, save_path='models/training_history_pytorch.png'):
        """
        Plot training history
        """
        fig, axes = plt.subplots(1, 2, figsize=(15, 5))
        
        # Loss plot
        axes[0].plot(self.history['train_loss'], label='Train Loss', marker='o')
        axes[0].plot(self.history['val_loss'], label='Val Loss', marker='s')
        axes[0].set_xlabel('Epoch')
        axes[0].set_ylabel('Loss')
        axes[0].set_title('Training and Validation Loss')
        axes[0].legend()
        axes[0].grid(True)
        
        # Accuracy plot
        axes[1].plot(self.history['train_acc'], label='Train Accuracy', marker='o')
        axes[1].plot(self.history['val_acc'], label='Val Accuracy', marker='s')
        axes[1].set_xlabel('Epoch')
        axes[1].set_ylabel('Accuracy (%)')
        axes[1].set_title('Training and Validation Accuracy')
        axes[1].legend()
        axes[1].grid(True)
        
        plt.tight_layout()
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        print(f"✓ Training history saved to: {save_path}")
        plt.show()
        
    def predict(self, image_path):
        """
        Predict disease from an image
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Predicted class name and confidence
        """
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        # Load and preprocess image
        transform = transforms.Compose([
            transforms.Resize((self.img_size, self.img_size)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        
        image = Image.open(image_path).convert('RGB')
        image_tensor = transform(image).unsqueeze(0).to(self.device)
        
        # Predict
        self.model.eval()
        with torch.no_grad():
            outputs = self.model(image_tensor)
            probabilities = torch.softmax(outputs, dim=1)
            confidence, predicted = probabilities.max(1)
        
        predicted_class = self.class_names[predicted.item()]
        confidence_pct = confidence.item() * 100
        
        return predicted_class, confidence_pct
        
    def save_model(self, filepath='models/plant_disease_pytorch.pth'):
        """
        Save the trained model
        """
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        torch.save({
            'model_state_dict': self.model.state_dict(),
            'class_names': self.class_names,
            'img_size': self.img_size,
            'history': self.history
        }, filepath)
        
        print(f"✓ Model saved to: {filepath}")
        
    def load_model(self, filepath='models/plant_disease_pytorch.pth'):
        """
        Load a trained model
        """
        # Explicitly set HOME environment variable for torch.load
        # to avoid permission issues
        old_home = os.environ.get('HOME')
        try:
            os.environ['HOME'] = '/tmp'
            
            checkpoint = torch.load(filepath, map_location=self.device)
            self.class_names = checkpoint['class_names']
            self.img_size = checkpoint.get('img_size', 224)
            self.history = checkpoint.get('history', {})
            
            # Rebuild model architecture
            self.build_model()
            self.model.load_state_dict(checkpoint['model_state_dict'])
            self.model.eval()
            
            print(f"✓ Model loaded from: {filepath}")
        finally:
            # Restore original HOME if it existed
            if old_home:
                os.environ['HOME'] = old_home
            elif 'HOME' in os.environ:
                del os.environ['HOME']


if __name__ == "__main__":
    print("\n" + "="*70)
    print("PLANT DISEASE DETECTION WITH PYTORCH + GPU")
    print("="*70)
    print("This model uses MobileNetV2 transfer learning with PyTorch")
    print("Optimized for NVIDIA GTX 1650 with CUDA acceleration")
    print("="*70 + "\n")
    
    # Initialize model
    model = PlantDiseaseDetectionModel(
        data_dir='data/PlantVillage',
        img_size=224,
        batch_size=32
    )
    
    # Prepare data
    model.prepare_data(train_split=0.8)
    
    # Build model
    model.build_model()
    
    # Train model
    model.train(epochs=50, learning_rate=0.001, patience=10)
    
    # Evaluate model
    model.evaluate()
    
    # Plot training history
    model.plot_training_history()
    
    # Save final model
    model.save_model('models/plant_disease_pytorch.pth')
    
    print("\n" + "="*70)
    print("MODEL TRAINING COMPLETE!")
    print("="*70)
    print("✓ Model saved and ready for inference")
    print("✓ GPU acceleration: ENABLED" if torch.cuda.is_available() else "✓ Using CPU")
    print("="*70 + "\n")
