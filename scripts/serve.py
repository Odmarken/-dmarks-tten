"""Build and serve locally. Run: python scripts/serve.py [--port 8000]."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from build import build, OUTPUT


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    build()
    handler = partial(SimpleHTTPRequestHandler, directory=str(OUTPUT))
    with ThreadingHTTPServer(("127.0.0.1", args.port), handler) as server:
        print(f"Local: http://127.0.0.1:{args.port}/", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
