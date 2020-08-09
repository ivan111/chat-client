import * as React from "react";

export interface ChatMessageProps { onSubmitMessage: (name:string, message: string) => void; }

export const ChatInput = (props: ChatMessageProps) => {
    const [name, setName] = React.useState("");
    const [message, setMessage] = React.useState("");

    return (<form action="." onSubmit={e => {
                e.preventDefault();
                props.onSubmitMessage(name, message);
                setMessage("");
            }}>
                <input className="name-input" type="text" placeholder={"名前"} value={name}
                    onChange={e => setName(e.target.value)}/>

                <input className="message-input" type="text" placeholder={"メッセージ"} value={message}
                    onChange={e => setMessage(e.target.value)}/>

                <button>送信</button>
            </form>);
};
