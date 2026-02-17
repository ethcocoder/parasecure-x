import torch
import torch.onnx
import os
import sys

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ml.model import SovereignStructuralTransformer

def export_to_onnx(model_path="ml/models/sst_v2_structural.pth", output_path="ml/models/sst_model.onnx"):
    print(f"[*] Loading PyTorch model from {model_path}...")
    
    # Initialize model with same hyperparameters
    model = SovereignStructuralTransformer(
        num_token_types=7, 
        vocab_size=1001
    )
    
    if not os.path.exists(model_path):
        print(f"[!] PyTorch model not found at {model_path}")
        return

    model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
    model.eval()

    # Create dummy input for ONNX export
    # The SST expects (type_ids, value_ids) with shape [batch, seq_len]
    dummy_type_ids = torch.randint(0, 7, (1, 10))
    dummy_value_ids = torch.randint(0, 1001, (1, 10))
    
    print(f"[*] Exporting to ONNX at {output_path}...")
    torch.onnx.export(
        model, 
        (dummy_type_ids, dummy_value_ids),
        output_path,
        export_params=True,
        opset_version=12,
        do_constant_folding=True,
        input_names=['type_ids', 'value_ids'],
        output_names=['logits'],
        dynamic_axes={
            'type_ids': {0: 'batch_size', 1: 'seq_len'},
            'value_ids': {0: 'batch_size', 1: 'seq_len'},
            'logits': {0: 'batch_size', 1: 'seq_len'}
        }
    )
    
    if os.path.exists(output_path):
        print(f"[SUCCESS] SST Model exported to {output_path}")
    else:
        print(f"[FAILURE] ONNX export failed.")

if __name__ == "__main__":
    export_to_onnx()
