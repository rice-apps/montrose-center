import type { ReactElement } from "react";
import type { ChatSummary } from "@/lib/api";

export type ChatSidebarProps = {
  chats: ChatSummary[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
};

// Task 2: list chats and let the user select or create one.
export function ChatSidebar(props: ChatSidebarProps): ReactElement{
 return (
  <aside>
    <div>
      <button
      style={{width: "100%", textAlign:"left", border: "2px solid black", background: "none", padding:"5px", margin:"5px", cursor:"pointer" }}
      onClick={() => props.onNewChat()}>
        New Chat
        <img style={{ width: '20px', height: 'auto' }} src="https://www.svgrepo.com/show/42233/pencil-edit-button.svg" className="placeholder"/>
      </button>

    </div>
    <div className="Recents">
      <p>Recents</p>
      <ul style={{listStyle: "none", paddingLeft: "10px"}}>
        {props.chats.map(chat => (
        <li key={chat.id}>
          <button style={{width: "100%", textAlign:"left", border: "none", background: "none", padding:"5px", margin:"5px", cursor:"pointer" }}
          onClick = {() => props.onSelectChat(chat.id)}>
            {chat.title}
          </button>
        </li>
        ))}
        </ul>
    </div>
  </aside>

 )
}
