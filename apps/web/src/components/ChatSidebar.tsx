import styles from './ChatSidebar.module.css';
import { Plus, Search, UserRound, ChevronRight } from 'lucide-react';
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
  <aside className={styles.sidebar}>
    <div className={styles.agentName}>
      Bot
    </div>
    <button className ={styles.newChat} onClick={props.onNewChat}>
        <Plus/><p className={styles.label}>New chat</p>
    </button>
    <div className={styles.recentChats}>
      <div className={styles.heading}>
        <p className={styles.label}>Recent chats</p><Search/>
      </div>
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
    <div className={styles.blankSpace}></div>
    <div className={styles.yourAccount}>
      <div className={styles.iconCircle}><UserRound/></div>
      <p className={styles.label}>Your account</p>
      <ChevronRight/>
    </div>
  </aside>

 )
}
