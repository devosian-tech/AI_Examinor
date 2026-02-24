#!/usr/bin/env python3
"""
Simple script to run the backend with proper environment setup
"""
import subprocess
import sys
import os

def run_backend():
    # Change to backend directory
    backend_dir = os.path.join(os.getcwd(), 'backend')
    
    # Activate virtual environment and run uvicorn
    if os.name == 'nt':  # Windows
        activate_script = os.path.join(backend_dir, 'venv', 'Scripts', 'activate.bat')
        cmd = f'"{activate_script}" && uvicorn main:app --reload --port 8000'
    else:  # Unix/Linux/macOS
        activate_script = os.path.join(backend_dir, 'venv', 'bin', 'activate')
        cmd = f'source "{activate_script}" && uvicorn main:app --reload --port 8000'
    
    print("🚀 Starting Document Tutor Backend...")
    print(f"📁 Working directory: {backend_dir}")
    print(f"🌐 Server will be available at: http://localhost:8000")
    print("=" * 50)
    
    # Run the command
    try:
        subprocess.run(cmd, shell=True, cwd=backend_dir, check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Error starting backend: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n🛑 Backend stopped by user")
        sys.exit(0)

if __name__ == "__main__":
    run_backend()