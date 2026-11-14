import styles from './ChatSidebar.module.css';
import { Plus, Search, UserRound, ChevronRight, MessageCircle } from 'lucide-react';
import type { ReactElement } from "react";
import type { ChatSummary } from "@/lib/api";

export type ChatSidebarProps = {
  chats: ChatSummary[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
};

type ChatGroup = { label: string; chats: ChatSummary[] };

function sortChats(chats: ChatSummary[]){
  const copy = [...chats]
  copy.sort((a,b)=> new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  return copy
}

function getGroupLabel(updated_at: string): string{
  const today = new Date();
  today.setHours(0,0,0,0);

  const DAY = 24*60*60*1000;

  const yesterday = today.getTime() - DAY;
  const sevenDays = today.getTime() - (DAY * 7)
  const thirtyDays = today.getTime() - (DAY * 30)
  
  const date = new Date(updated_at);
  const chatTime = date.getTime();
    
  if (chatTime >= today.getTime()) return "Today";
  else if (chatTime >= yesterday) return "Yesterday";
  else if (chatTime >= sevenDays) return "Previous 7 days"; 
  else if (chatTime >= thirtyDays) return "Previous 30 days"; 
  else return date.toLocaleString("en-US", {month: "long", year: "numeric"})
}

function groupChats(chats: ChatSummary[]):ChatGroup[] {
  const groups: ChatGroup[] = []
  for (const chat of chats){
    const label = getGroupLabel(chat.updated_at)
    const last = groups[groups.length-1]

    if (last && last.label === label){
      last.chats.push(chat);
    }
    else{
      groups.push({label: label, chats: [chat]});
    }
  }
  return groups;
}

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
      {groupChats(sortChats(props.chats)).map(group => (
        <div key={group.label} className={styles.group}>
          <p className={styles.groupLabel}>{group.label}</p>
          <ul className={styles.chatList}>
            {group.chats.map(chat => (
            <li key={chat.id}>
              <button className={styles.listItems} onClick = {() => props.onSelectChat(chat.id)}>
                <MessageCircle/>
                {chat.title}
              </button>
            </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div className={styles.yourAccount}>
      <div className={styles.iconCircle}><UserRound/></div>
      <p className={styles.label}>Your account</p>
      <ChevronRight/>
    </div>
  </aside>

 )
}
