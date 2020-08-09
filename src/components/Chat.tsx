import * as React from "react";
import { ChatInput } from "./ChatInput";

const URL = "wss://vanya.jp.net/chat-ws/room";

function useInterval(callback: () => void, delay: number) {
    const savedCallback = React.useRef(() => {});

    React.useEffect(() => {
            savedCallback.current = callback;
            }, [callback]);

    React.useEffect(() => {
            function tick() {
                savedCallback.current();
            }
            if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
            }
            }, [delay]);
}

function getElapsed(from: Date): string {
    var elapsedStr: string

    var diff = new Date().getTime() - from.getTime();
    if (diff < 0) {
        return "";
    }
    var elapsed = new Date(diff);
    if (!elapsed) {
        return "";
    }

    if (elapsed.getUTCFullYear() - 1970) {
        elapsedStr = "(" + (elapsed.getUTCFullYear() - 1970) + "年前)";
    } else if (elapsed.getUTCMonth()) {
        elapsedStr = "(" + elapsed.getUTCMonth() + "ヶ月前)";
    } else if (elapsed.getUTCDate() - 1) {
        elapsedStr = "(" + (elapsed.getUTCDate() - 1) + "日前)";
    } else if (elapsed.getUTCHours()) {
        elapsedStr = "(" + elapsed.getUTCHours() + "時間前)";
    } else if (elapsed.getUTCMinutes()) {
        elapsedStr = "(" + elapsed.getUTCMinutes() + "分前)";
    } else {
        elapsedStr = "";
    }

    return elapsedStr;
}

function deepClone2(obj: any) {
    if (!(typeof obj === "object")) {
        return obj
    }

    let cloneObj

    let Constructor = obj.constructor
    switch (Constructor) {
        case Date:
            cloneObj = new Constructor(obj.getTime())
            break
        default:
            cloneObj = new Constructor()
    }

    for (let prop in obj) {
        cloneObj[prop] = deepClone2(obj[prop]);
    }

    return cloneObj;
}

export const Chat = () => {
    const [messages, setMessages] = React.useState([]);
    const [infoMessage, setInfoMessages] = React.useState("");
    const ws = React.useRef(null);
    const sendMessage = React.useRef((name:string, msg:string) => {});

    React.useEffect(() => {
        ws.current = new WebSocket(URL);
        ws.current.onopen = () => console.log("WebSocket open");
        ws.current.onclose = () => console.log("WebSocket close");
        ws.current.onmessage = (evt: any) => {
            const message = JSON.parse(evt.data);

            switch (message.type) {
            case 1:  // Text Message
                message.time = new Date(message.time);
                message.elapsed = getElapsed(message.time);
                setMessages(prev => [message, ...prev]);
                break;

            case 2:  // Error Message
            case 3:  // Info Message
                setInfoMessages(message.message);
                break;
            }
        };

        sendMessage.current = (name:string, msg: string) => {
            if (!ws.current) return;
            if (msg == "") return;

            if (name.length > 16) {
                setInfoMessages("名前が長すぎ。最大16文字まで");
                return;
            }

            if (msg.length > 140) {
                setInfoMessages("メッセージが長すぎ。最大140文字まで");
                return;
            }

            ws.current.send(JSON.stringify({name: name, message: msg}));
            setInfoMessages("");
        };

        return () => ws.current.close();
    }, []);

    useInterval(() => {
        const newMessages = deepClone2(messages)
        setMessages(newMessages.map((msg: any) => {
            msg.elapsed = getElapsed(msg.time);
            return msg;
        }));
    }, 20000);

    return (
        <div>
            <ChatInput onSubmitMessage={sendMessage.current} />

            {(() => {
                if (infoMessage != "") {
                    return (<p className="info-message">{infoMessage}</p>);
                }
            })()}

            <ul>
                {messages.map((message) =>
                    <li key={message.id}><span className="name-column"><strong style={{color: message.color}}>{message.name}</strong></span> {message.message} {message.elapsed}</li>)}
            </ul>
        </div>
    )
}
