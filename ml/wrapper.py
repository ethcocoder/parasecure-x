import torch
import torch.nn as nn
import os
import sys
import hashlib

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ml.model import SovereignStructuralTransformer

class SSTWrapper:
    """
    Wraps the SST model for inference within the Encoder/Decoder.
    Ensures deterministic structural predictions.
    """
    
    CAT_LIST = sorted(['METHOD', 'PATH', 'VERSION', 'HEADER_NAME', 'HEADER_VALUE'])
    CAT_MAP = {t: i for i, t in enumerate(CAT_LIST)}
    REV_CAT_MAP = {i: t for t, i in CAT_MAP.items()}

    def __init__(self, model_path="ml/models/sst_v2_structural.pth"):
        self.device = torch.device("cpu") # Inference on CPU for portability
        self.model = SovereignStructuralTransformer(
            num_token_types=7, 
            vocab_size=1001
        ).to(self.device)
        
        if os.path.exists(model_path):
            self.model.load_state_dict(torch.load(model_path, map_location=self.device))
            print(f"[*] SSTWrapper: Loaded model from {model_path}")
        else:
            print(f"[!] SSTWrapper: Model not found at {model_path}")
            
        self.model.eval()

    def predict_next_category(self, history):
        """
        Given a list of (base_type, value) pairs, predict the most likely next category.
        history: List of (str, str)
        """
        if not history:
            return "METHOD" # Start of HTTP
            
        t_ids = []
        v_ids = []
        
        for base_type, val in history:
            t_ids.append(self.CAT_MAP.get(base_type, 5))
            v_hash = int(hashlib.md5(val.encode()).hexdigest(), 16) % 1000
            v_ids.append(v_hash)
            
        t_tensor = torch.tensor([t_ids]).to(self.device)
        v_tensor = torch.tensor([v_ids]).to(self.device)
        
        with torch.no_grad():
            logits = self.model(t_tensor, v_tensor)
            last_logits = logits[0, -1, :]
            pred_id = torch.argmax(last_logits).item()
            
        return self.REV_CAT_MAP.get(pred_id, "HEADER_NAME")

if __name__ == "__main__":
    wrapper = SSTWrapper()
    # Mock history: GET /index.html
    history = [("METHOD", "GET"), ("PATH", "/index.html")]
    pred = wrapper.predict_next_category(history)
    print(f"Next Category Prediction: {pred}")
