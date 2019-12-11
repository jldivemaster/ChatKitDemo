import Chatkit from '@pusher/chatkit-client';
import axios from 'axios';

    function handleInput(event) {
      const { value, name } = event.target;

      this.setState({
        [name]: value,
      })
    };


//======= Creating user: Chatkit mgr is instantiated with Instance locator, userId, and Token

    function connectToChatkit(event) {
      event.preventDefault();

      const { userId } = this.state;

      if (userId === null || userId.trim() === '') {
        alert('Invalid userId');
        return;
      }

      axios
        .post('http://localhost:5200/users', { userId })
        .then(() => {
          const tokenProvider = new Chatkit.TokenProvider({
            url: 'https://us1.pusherplatform.io/services/chatkit_token_provider/v1/13723b1c-1013-4ba1-ae2b-44085914f8d9/token',
          });

          const chatManager = new Chatkit.ChatManager({
            instanceLocator: 'v1:us1:13723b1c-1013-4ba1-ae2b-44085914f8d9',
            userId,
            tokenProvider,
          });

// ===== Connect method creates user & sets to currentUser
          return chatManager
            .connect({
              onAddedToRoom: room => {
                const { rooms } = this.state;
                this.setState({
                  rooms: [...rooms, room],
                });
              },
            })
            .then(currentUser => {
              this.setState(
                {
                  currentUser,
                  showLogin: false,
                  rooms: currentUser.rooms,
                },
                // console.log(this.state)
              );
            });
        })
        .catch(console.error);
    }


// === Adding user to a Room

    function connectToRoom(id){
      // console.log("connectToRoom", e)
      const { currentUser } = this.state;
      // const id = '0cae2d11-2596-45f5-ae65-39a4ba68b7df'

      this.setState({
        messages: [],
      });

      return currentUser.subscribeToRoom({
        roomId: id,
        messageLimit: 100,
        hooks: {
          onMessage: message => {
            this.setState({
              messages: [...this.state.messages, message]
            })
          },
          onPresenceChanged: () => {
            const { currentRoom } = this.state;
            this.setState({
              roomUsers: currentRoom.users.sort(a => {
                if(a.presence.state === 'online') return -1;

                return 1;
              })
            })
          }
        }
      })
        .then(currentRoom => {
          const roomName = currentRoom.customData && currentRoom.customData.isDirectMessage
            ? currentRoom.customData.userIds.filter(id => id !== currentUser.id)[0]
            : currentRoom.name;
            // console.log(currentUser, currentRoom, id)
          this.setState({
            currentRoom,
            roomUsers: currentRoom.users,
            rooms: currentUser.rooms,
            roomName,
          })
        }).catch(console.error);
    };

    //==== Sending Messages: Add this below the other functions
    function sendMessage(event) {
      event.preventDefault();
      const { newMessage, currentUser, currentRoom } = this.state;

      if (newMessage.trim() === '') return;

      currentUser.sendMessage({
        text: newMessage,
        roomId: `${currentRoom.id}`,
      });

      this.setState({
        newMessage: '',
      });
    }

    function createPrivateRoom(id) {
      const { currentUser, rooms } = this.state;
      const roomName = `${currentUser.id}_${id}`;

      const isPrivateChatCreated = rooms.filter(room => {
        if (room.customData && room.customData.isDirectMessage) {
          const arr = [currentUser.id, id];
          const { userIds } = room.customData;

          if (arr.sort().join('') === userIds.sort().join('')) {
            return {
              room,
            };
          }
        }

        return false;
      });

      if (isPrivateChatCreated.length > 0) {
        return Promise.resolve(isPrivateChatCreated[0]);
      }

      return currentUser.createRoom({
        name: `${roomName}`,
        private: true,
        addUserIds: [`${id}`],
        customData: {
          isDirectMessage: true,
          userIds: [currentUser.id, id],
        },
      });
    }

    function sendDM(id) {
      createPrivateRoom.call(this, id).then(room => {
        connectToRoom.call(this, room.id);
      });
    }

    //====== Export the methods
    export { handleInput, connectToRoom, connectToChatkit, sendMessage, sendDM }
