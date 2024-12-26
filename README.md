### Wanna see live demo?

[Blackjack Game](http://blackjack-game.duckdns.org:3000/)

# AWS Game Challenge

This project leverages AWS services to create a multiplayer game. The services used include:

- **DynamoDB** for storing multiplayer game state and player data.
- **EC2** for hosting the game server.
- **S3** for storing and serving game assets.
- **Amazon Q** for assisting in the development process.

## AWS Services Used

### DynamoDB

We use **DynamoDB** to store the game data, such as player information and game states. This allows for persistent storage and scalability for multiplayer sessions.

### EC2

The game server is hosted on an **EC2 instance**. It handles WebSocket connections and runs the game logic for real-time multiplayer interactions.

### S3

Game assets (such as images, sounds, etc.) are stored in **S3** buckets. These assets are served from S3 to the clients for an enhanced gaming experience.

### Amazon Q

**Amazon Q** was utilized during the development process for assistance with debugging, optimization, and improving the overall coding flow.
