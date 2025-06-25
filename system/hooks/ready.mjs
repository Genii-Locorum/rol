import { ROLSystemSocket } from '../apps/Sockets/rol-system-socket.mjs';

export default function Ready() {
  game.socket.on('system.rol', async data => {
    ROLSystemSocket.callSocket(data)
  });

  console.log("/////////////////////////////////////")
  console.log("//  Rivers of London System Ready  //")
  console.log("/////////////////////////////////////")

}