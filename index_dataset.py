import os
import sqlite3
import glob

def find_latest_dataset():
    base_cache = os.path.expanduser("~/.cache/kagglehub/datasets/adarshsingh0903/legal-dataset-sc-judgments-india-19502024/versions")
    if not os.path.exists(base_cache):
        print("Kaggle cache directory not found yet:", base_cache)
        return None
    versions = os.listdir(base_cache)
    if not versions:
        print("No versions found in Kaggle cache yet.")
        return None
    # Sort by version number/name
    latest_version = sorted(versions)[-1]
    return os.path.join(base_cache, latest_version)

def build_index():
    dataset_path = find_latest_dataset()
    if not dataset_path:
        print("Dataset not ready for indexing.")
        return

    print("Found dataset path:", dataset_path)
    db_path = os.path.join(os.path.dirname(__file__), "judgments.db")
    
    # Establish SQLite Connection
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS judgments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            year INTEGER,
            filename TEXT,
            filepath TEXT,
            specialization TEXT,
            summary TEXT
        )
    """)
    
    # Empty existing records to avoid duplicates
    cursor.execute("DELETE FROM judgments")
    conn.commit()

    print("Scanning directory structure for PDFs...")
    pdf_files = glob.glob(os.path.join(dataset_path, "**", "*.pdf"), recursive=True)
    print(f"Discovered {len(pdf_files)} judgment PDFs. Building database index...")

    records = []
    for filepath in pdf_files:
        filename = os.path.basename(filepath)
        # Parse year from the parent directory
        parent_dir = os.path.basename(os.path.dirname(filepath))
        try:
            year = int(parent_dir)
        except ValueError:
            year = 2000 # fallback
        
        # Clean title from filename
        title_raw = os.path.splitext(filename)[0]
        title = title_raw.replace("_", " ").replace("-", " ")
        
        # Category heuristic
        title_lower = title.lower()
        if any(w in title_lower for w in ["state", "police", "union", "murder", "commissioner"]):
            spec = "Constitutional & Criminal"
        elif any(w in title_lower for w in ["wife", "husband", "marriage", "divorce", "son", "daughter"]):
            spec = "Family Law"
        elif any(w in title_lower for w in ["land", "property", "estate", "rent", "tenant"]):
            spec = "Property & Civil"
        elif any(w in title_lower for w in ["tax", "company", "ltd", "corp", "finance", "bank"]):
            spec = "Corporate & Financial"
        else:
            spec = "Civil Law"
            
        summary = f"Supreme Court of India judgment delivered in the year {year}. Case Title: {title}. Specialized category: {spec}."
        
        records.append((title, year, filename, filepath, spec, summary))
        
        # Batch commit every 1000 items
        if len(records) >= 1000:
            cursor.executemany("""
                INSERT INTO judgments (title, year, filename, filepath, specialization, summary)
                VALUES (?, ?, ?, ?, ?, ?)
            """, records)
            records = []

    if records:
        cursor.executemany("""
            INSERT INTO judgments (title, year, filename, filepath, specialization, summary)
            VALUES (?, ?, ?, ?, ?, ?)
        """, records)

    conn.commit()
    
    # Optimize search performance by adding index columns
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_judgments_title ON judgments(title)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_judgments_year ON judgments(year)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_judgments_spec ON judgments(specialization)")
    conn.commit()
    
    # Query test
    cursor.execute("SELECT COUNT(*) FROM judgments")
    total = cursor.fetchone()[0]
    print(f"Successfully created SQL database index with {total} Supreme Court judgments.")
    conn.close()

if __name__ == "__main__":
    build_index()
