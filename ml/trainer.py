print("[*] Initializing PAREE-SST Training Environment (Loading Torch)...")
import sys
import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import hashlib
import time

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ml.model import SovereignStructuralTransformer
from ml.generator import ProtocolDataGenerator

class ProtocolDataset(Dataset):
    def __init__(self, raw_data):
        self.samples = []
        for sequence in raw_data:
            t_ids = torch.tensor([t for t, v in sequence])
            v_ids = torch.tensor([v for t, v in sequence])
            self.samples.append((t_ids, v_ids))
            
    def __len__(self):
        return len(self.samples)
        
    def __getitem__(self, idx):
        return self.samples[idx]

def train_sst():
    # 1. Generate Training Data
    print("[*] Phase 1: Generating Synthetic Protocol Dataset...")
    gen = ProtocolDataGenerator()
    raw_dataset = gen.generate_dataset(size=2000)
    print(f"[OK] Generated {len(raw_dataset)} protocol sequences.")
    
    # Preprocess into Next-Category Prediction Task
    X_types = []
    X_vals = []
    Y_next_type = []
    
    print("[*] Phase 2: Building structural transition map...")
    for sequence in raw_dataset:
        for i in range(1, len(sequence)):
            X_types.append(torch.tensor([t for t, v in sequence[:i]]))
            X_vals.append(torch.tensor([v for t, v in sequence[:i]]))
            Y_next_type.append(sequence[i][0])
            
    from torch.nn.utils.rnn import pad_sequence
    X_types_pad = pad_sequence(X_types, batch_first=True, padding_value=0)
    X_vals_pad = pad_sequence(X_vals, batch_first=True, padding_value=0)
    Y_next_type = torch.tensor(Y_next_type)
    
    # 3. Model
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[*] Phase 3: Initializing Sovereign Structural Transformer (SST) on {device}...")
    model = SovereignStructuralTransformer(
        num_token_types=7, 
        vocab_size=1001
    ).to(device)
    
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    criterion = nn.CrossEntropyLoss()
    
    print(f"[*] Phase 4: Starting Training on {len(X_types)} structural transitions...")
    model.train()
    
    batch_size = 64
    num_batches = len(X_types_pad) // batch_size
    
    for epoch in range(5):
        epoch_loss = 0
        start_time = time.time()
        
        for i in range(0, len(X_types_pad), batch_size):
            batch_idx = i // batch_size
            tx = X_types_pad[i:i+batch_size].to(device)
            vx = X_vals_pad[i:i+batch_size].to(device)
            ty = Y_next_type[i:i+batch_size].to(device)
            
            optimizer.zero_grad()
            logits = model(tx, vx)
            last_logits = logits[:, -1, :]
            
            loss = criterion(last_logits, ty)
            loss.backward()
            optimizer.step()
            epoch_loss += loss.item()
            
            if batch_idx % 50 == 0:
                print(f"  > Epoch {epoch+1} | Batch {batch_idx}/{num_batches} | Loss: {loss.item():.4f}")
            
        avg_loss = epoch_loss / max(1, num_batches)
        elapsed = time.time() - start_time
        print(f"[*] Epoch {epoch+1} Complete | Avg Loss: {avg_loss:.4f} | Time: {elapsed:.2f}s")

    # 5. Save
    os.makedirs("ml/models", exist_ok=True)
    model_path = "ml/models/sst_v2_structural.pth"
    torch.save(model.state_dict(), model_path)
    print(f"[SUCCESS] Sovereign Structural Model saved to {model_path}")

if __name__ == "__main__":
    try:
        train_sst()
    except Exception as e:
        print(f"[ERROR] Training Failed: {str(e)}")
        sys.exit(1)
