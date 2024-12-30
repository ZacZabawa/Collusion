import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import subprocess
import os
import json

class VaultHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if event.is_directory:
            return
            
        print(f"Detected change in {event.src_path}")
        if event.src_path.endswith('.md'):
            self.update_pipeline()

    def update_pipeline(self):
        try:
            # Run publish script
            subprocess.run(["python", "/app/publish_notes.py"], check=True)
            
            # Run hierarchy creator
            subprocess.run(["node", "/app/hierarchyCreator.js"], check=True)
            
            # Rebuild Jekyll
            subprocess.run(["bundle", "exec", "jekyll", "build"], check=True)
            
            print("Pipeline update complete!")
            
        except subprocess.CalledProcessError as e:
            print(f"Error in update pipeline: {e}")

def main():
    vault_path = os.environ.get('VAULT_PATH', '/vault')
    event_handler = VaultHandler()
    observer = Observer()
    observer.schedule(event_handler, vault_path, recursive=True)
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

if __name__ == "__main__":
    main() 