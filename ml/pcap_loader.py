import sys
import os
from scapy.all import rdpcap, TCP, Raw
import hashlib

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.tokenizer.http_tokenizer import HTTPTokenizer

class PCAPIngestor:
    """
    Ingests real-world network captures to provide training data for the SST.
    This moves the engine from synthetic patterns to real-world fidelity.
    """
    
    def __init__(self):
        self.tokenizer = HTTPTokenizer()

    def extract_http_from_pcap(self, pcap_path):
        """
        Parses a PCAP file and extracts HTTP sequences as structural tokens.
        """
        if not os.path.exists(pcap_path):
            print(f"[!] PCAP not found: {pcap_path}")
            return []

        print(f"[*] Reading packets from {pcap_path}...")
        packets = rdpcap(pcap_path)
        dataset = []

        for pkt in packets:
            if pkt.haslayer(Raw) and pkt.haslayer(TCP):
                payload = pkt[Raw].load.decode(errors='ignore')
                if payload.startswith(('GET ', 'POST ', 'PUT ', 'PATCH ', 'DELETE ')):
                    try:
                        tokens = self.tokenizer.tokenize(payload)
                        # Convert to the categorical sequence required by SST
                        sequence = self._tokenize_to_ids(tokens)
                        dataset.append(sequence)
                    except Exception as e:
                        # Skip malformed HTTP in real-world captures
                        continue
        
        print(f"[OK] Extracted {len(dataset)} valid HTTP sequences from PCAP.")
        return dataset

    def _tokenize_to_ids(self, tokens):
        # Mirror logic from generator.py to maintain consistency
        type_list = sorted(['METHOD', 'PATH', 'VERSION', 'HEADER_NAME', 'HEADER_VALUE'])
        type_map = {t: i for i, t in enumerate(type_list)}
        
        sequence = []
        for t in tokens:
            # Simple heuristic for token categorization (can be improved)
            base_type = 'UNKNOWN'
            # (Matches logic in generator.py)
            # ...
            val_hash = int(hashlib.md5(t.value.encode()).hexdigest(), 16) % 1000
            sequence.append((0, val_hash)) # Placeholder for real category mapping
        return sequence

if __name__ == "__main__":
    ingestor = PCAPIngestor()
    # Usage: ingestor.extract_http_from_pcap("path/to/real_traffic.pcap")
    print("[*] PCAPIngestor ready for real-world data bridge.")
