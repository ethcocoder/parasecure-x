import torch
import torch.nn as nn
import torch.nn.functional as F

class SovereignStructuralTransformer(nn.Module):
    """
    A lightweight Transformer-lite model for learning protocol semantics.
    Optimized for device-level inference.
    """
    def __init__(self, num_token_types, vocab_size, embed_dim=64, nhead=4, num_layers=2):
        super(SovereignStructuralTransformer, self).__init__()
        
        # Embeddings for Token Types (METHOD, PATH, etc.)
        self.type_embedding = nn.Embedding(num_token_types, embed_dim)
        
        # Embeddings for Token Values (could be hashed or from a vocabulary)
        self.value_embedding = nn.Embedding(vocab_size, embed_dim)
        
        # Position encoding to capture structural order
        self.pos_embedding = nn.Parameter(torch.zeros(1, 100, embed_dim * 2))
        
        # Combined embedding dimension is 2 * embed_dim (type + value)
        layer = nn.TransformerEncoderLayer(d_model=embed_dim * 2, nhead=nhead, batch_first=True)
        self.transformer = nn.TransformerEncoder(layer, num_layers=num_layers)
        
        # Final projection to structural context space
        self.fc = nn.Linear(embed_dim * 2, 64)
        
    def forward(self, type_ids, value_ids):
        # type_ids: [batch, seq_len]
        # value_ids: [batch, seq_len]
        
        t_embed = self.type_embedding(type_ids)
        v_embed = self.value_embedding(value_ids)
        
        # Concat type and value information
        x = torch.cat([t_embed, v_embed], dim=-1)
        
        # Add positional information
        x = x + self.pos_embedding[:, :x.size(1), :]
        
        # Pass through transformer layers
        context = self.transformer(x)
        
        # Output: Probability distribution over the NEXT token categories
        # This helps the encoder pick a "natural" decoy for the next position
        logits = self.fc(context)
        
        return logits


if __name__ == "__main__":
    # Test model with dummy data
    model = SovereignStructuralTransformer(num_token_types=10, vocab_size=500)
    dummy_types = torch.randint(0, 10, (1, 20))
    dummy_values = torch.randint(0, 500, (1, 20))
    
    out = model(dummy_types, dummy_values)
    print(f"Structural Context Shape: {out.shape}") # Expect [1, 20, 64]
