from typing import Dict, List, Set
from fastapi import WebSocket

class ConnectionManager:
    """Manages WebSocket connections for chat rooms based on rental_id."""
    def __init__(self):
        # A dictionary to hold active connections for each chat room (rental_id).
        # The key is the rental_id (as a string), and the value is a set of WebSockets.
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, rental_id: str):
        """Accepts a new WebSocket connection and adds it to the appropriate room."""
        await websocket.accept()
        if rental_id not in self.active_connections:
            self.active_connections[rental_id] = set()
        self.active_connections[rental_id].add(websocket)
        print(f"WebSocket connected to rental_id: {rental_id}. Total connections for this room: {len(self.active_connections[rental_id])}")

    def disconnect(self, websocket: WebSocket, rental_id: str):
        """Removes a WebSocket connection from a room."""
        if rental_id in self.active_connections:
            self.active_connections[rental_id].remove(websocket)
            # If the room is empty, remove it from the dictionary
            if not self.active_connections[rental_id]:
                del self.active_connections[rental_id]
        print(f"WebSocket disconnected from rental_id: {rental_id}.")

    async def broadcast(self, message: str, rental_id: str):
        """Broadcasts a message to all connected clients in a specific room."""
        if rental_id in self.active_connections:
            # Create a list of connections to iterate over to avoid issues with changing the set size during iteration
            for connection in list(self.active_connections[rental_id]):
                try:
                    await connection.send_text(message)
                except RuntimeError as e:
                    print(f"Error broadcasting to websocket for rental_id {rental_id}: {e}")
                    # Optionally remove the broken connection
                    self.active_connections[rental_id].remove(connection)

# Create a single instance of the ConnectionManager to be used by the router
manager = ConnectionManager()
