import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { AiOutlineArrowRight, AiOutlineSend } from "react-icons/ai";
import { TfiGallery } from "react-icons/tfi";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import socketIO from "socket.io-client";
import { format } from "timeago.js";
import { backend_url, SOCKET_URL } from "../../server";
import styles from "../../styles/styles";

// Initialize socket with better connection handling
let socket;

const DashboardMessages = () => {
  const { seller } = useSelector((state) => state.seller);
  const [conversations, setConversations] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [currentChat, setCurrentChat] = useState();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userData, setUserData] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeStatus, setActiveStatus] = useState(false);
  const [open, setOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection with more robust connection options
    try {
      const socketOptions = {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        autoConnect: true,
        forceNew: true,
        path: '/socket.io',
        secure: process.env.NODE_ENV === 'production'
      };

      socket = socketIO(SOCKET_URL, socketOptions);
      
      console.log("DashboardMessages: Attempting to connect to socket server:", SOCKET_URL);
      
      // Socket connection handling
      socket.on("connect", () => {
        console.log("DashboardMessages: Socket connected successfully!");
        if (seller?._id) {
          socket.emit("addUser", seller._id);
        }
      });
      
      socket.on("connect_error", (err) => {
        console.error("DashboardMessages: Socket connection error:", err.message);
        toast.error("Chat service connection failed. Some features may not work properly.");
      });
      
      socket.on("disconnect", (reason) => {
        console.log("DashboardMessages: Socket disconnected:", reason);
        if (reason === "io server disconnect") {
          // Reconnect if server disconnected us
          socket.connect();
        }
      });

      socket.on("getMessage", (data) => {
        setArrivalMessage({
          sender: data.senderId,
          text: data.text,
          createdAt: Date.now(),
        });
      });

      socket.on("getUsers", (data) => {
        setOnlineUsers(data);
      });

      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    } catch (error) {
      console.error("Error initializing socket:", error);
      toast.error("Failed to initialize chat service");
    }
  }, [seller]);

  useEffect(() => {
    if (arrivalMessage && currentChat?.members.includes(arrivalMessage.sender)) {
      setMessages((prev) => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    const getConversations = async () => {
            try {
        const response = await axios.get(
          `${window.RUNTIME_CONFIG.API_URL}/conversation/get-all-conversations/${seller?._id}`,
          {
            withCredentials: true,
          }
        );
        setConversations(response.data.conversations);
      } catch (error) {
        console.error("Error fetching conversations:", error);
        toast.error("Failed to load conversations");
      }
    };

    if (seller?._id) {
      getConversations();
    }
  }, [seller]);

  const onlineCheck = (chat) => {
    const chatMembers = chat.members.find((member) => member !== seller?._id);
    const online = onlineUsers.find((user) => user.userId === chatMembers);
    return Boolean(online);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setUploadedImage(file);
    if (file) {
      imageSendingHandler(file);
    }
  };

  const imageSendingHandler = async (file) => {
    try {
      const formData = new FormData();
      formData.append("images", file);
      formData.append("sender", seller._id);
      formData.append("text", newMessage);
      formData.append("conversationId", currentChat._id);

      const receiverId = currentChat.members.find(
        (member) => member !== seller._id
      );

      socket.emit("sendMessage", {
        senderId: seller._id,
        receiverId,
        images: file,
      });

            const { data } = await axios.post(
        `${window.RUNTIME_CONFIG.API_URL}/message/create-new-message`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUploadedImage(null);
      setMessages([...messages, data.message]);
      await updateLastMessageForImage();
    } catch (error) {
      console.error("Error sending image:", error);
      toast.error("Failed to send image");
    }
  };

  const sendMessageHandler = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() && !uploadedImage) return;

    try {
      const receiverId = currentChat.members.find(
        (member) => member !== seller._id
      );

      socket.emit("sendMessage", {
        senderId: seller._id,
        receiverId,
        text: newMessage,
      });

            const { data } = await axios.post(`${window.RUNTIME_CONFIG.API_URL}/message/create-new-message`, {
        sender: seller._id,
        text: newMessage,
        conversationId: currentChat._id,
      });

      setMessages([...messages, data.message]);
      setNewMessage("");
      await updateLastMessage();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const updateLastMessage = async () => {
    try {
      socket.emit("updateLastMessage", {
        lastMessage: newMessage,
        lastMessageId: seller._id,
      });

      await axios.put(
        `${server}/conversation/update-last-message/${currentChat._id}`,
        {
          lastMessage: newMessage,
          lastMessageId: seller._id,
        }
      );
    } catch (error) {
      console.error("Error updating last message:", error);
    }
  };

  const updateLastMessageForImage = async () => {
    try {
      await axios.put(
        `${server}/conversation/update-last-message/${currentChat._id}`,
        {
          lastMessage: "Photo",
          lastMessageId: seller._id,
        }
      );
    } catch (error) {
      console.error("Error updating last message for image:", error);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="w-full bg-white">
      {!open ? (
        <div className="w-full">
          <h1 className="text-center text-[30px] py-3 font-Poppins">
            All Messages
          </h1>
          {/* All messages list */}
          {conversations.map((item, index) => (
            <MessageList
              key={index}
              data={item}
              index={index}
              setOpen={setOpen}
              setCurrentChat={setCurrentChat}
              me={seller?._id}
              setUserData={setUserData}
              userData={userData}
              online={onlineCheck(item)}
              setActiveStatus={setActiveStatus}
            />
          ))}
        </div>
      ) : (
        <SellerInbox
          setOpen={setOpen}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessageHandler={sendMessageHandler}
          messages={messages}
          sellerId={seller?._id}
          userData={userData}
          activeStatus={activeStatus}
          scrollRef={scrollRef}
          handleImageUpload={handleImageUpload}
        />
      )}
    </div>
  );
};

const MessageList = ({
  data,
  index,
  setOpen,
  setCurrentChat,
  me,
  setUserData,
  userData,
  online,
  setActiveStatus,
}) => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const getUser = async () => {
      try {
        const userId = data.members.find((user) => user !== me);
        const { data: response } = await axios.get(
          `${server}/shop/get-shop-info/${userId}`
        );
        setUserData(response.shop);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    getUser();
    setActiveStatus(online);
  }, [me, data, setUserData, online, setActiveStatus]);

  const handleClick = () => {
    setOpen(true);
    setCurrentChat(data);
  };

  return (
    <div
      className={`w-full flex p-3 px-3 ${
        active === index ? "bg-[#00000010]" : "bg-transparent"
      } cursor-pointer`}
      onClick={() => {
        setActive(index);
        handleClick();
      }}
    >
      <div className="relative">
        <img
          src={`${backend_url}uploads/${userData?.avatar}`}
          alt={userData?.name || "User avatar"}
          className="w-[50px] h-[50px] rounded-full"
        />
        <div
          className={`w-[12px] h-[12px] rounded-full absolute top-[2px] right-[2px] ${
            online ? "bg-green-400" : "bg-[#c7b9b9]"
          }`}
        />
      </div>
      <div className="pl-3">
        <h1 className="text-[18px]">{userData?.name}</h1>
        <p className="text-[16px] text-[#000c]">
          {data?.lastMessageId !== userData?._id
            ? "You:"
            : `${userData?.name?.split(" ")[0]}:`}{" "}
          {data?.lastMessage}
        </p>
      </div>
    </div>
  );
};

const SellerInbox = ({
  setOpen,
  newMessage,
  setNewMessage,
  sendMessageHandler,
  messages,
  sellerId,
  userData,
  activeStatus,
  scrollRef,
  handleImageUpload,
}) => {
  return (
    <div className="w-full min-h-full flex flex-col justify-between p-5">
      {/* message header */}
      <div className="w-full flex p-3 items-center justify-between bg-slate-200">
        <div className="flex">
          <img
            src={`${backend_url}uploads/${userData?.avatar}`}
            alt={userData?.name || "User avatar"}
            className="w-[60px] h-[60px] rounded-full"
          />
          <div className="pl-3">
            <h1 className="text-[18px] font-[600]">{userData?.name}</h1>
            {activeStatus && <h1>Active Now</h1>}
          </div>
        </div>
        <AiOutlineArrowRight
          size={20}
          className="cursor-pointer"
          onClick={() => setOpen(false)}
        />
      </div>

      {/* messages */}
      <div className="px-3 h-[75vh] py-3 overflow-y-scroll">
        {messages.map((item, index) => (
          <div
            key={index}
            className={`flex w-full my-2 ${
              item.sender === sellerId ? "justify-end" : "justify-start"
            }`}
            ref={scrollRef}
          >
            {item.sender !== sellerId && (
              <img
                src={`${backend_url}uploads/${userData?.avatar}`}
                alt={userData?.name || "User avatar"}
                className="w-[40px] h-[40px] rounded-full mr-3"
              />
            )}
            {item.images && (
              <img
                src={`${backend_url}uploads/${item.images}`}
                alt="Message attachment"
                className="w-[300px] h-[300px] object-cover rounded-[10px] ml-2 mb-2"
              />
            )}
            {item.text !== "" && (
              <div>
                <div
                  className={`w-max p-2 rounded ${
                    item.sender === sellerId ? "bg-[#000]" : "bg-[#38c776]"
                  } text-[#fff] h-min`}
                >
                  <p>{item.text}</p>
                </div>
                <p className="text-[12px] text-[#000000d3] pt-1">
                  {format(item.createdAt)}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* send message input */}
      <form
        className="p-3 relative w-full flex justify-between items-center"
        onSubmit={sendMessageHandler}
      >
        <div className="w-[30px]">
          <input
            type="file"
            name="image"
            id="image"
            className="hidden"
            onChange={handleImageUpload}
            accept="image/*"
          />
          <label htmlFor="image" className="cursor-pointer">
            <TfiGallery size={20} />
          </label>
        </div>
        <div className="w-full">
          <input
            type="text"
            required
            placeholder="Enter your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className={`${styles.input}`}
          />
          <button type="submit" className="hidden">Send</button>
          <AiOutlineSend
            size={20}
            className="absolute right-4 top-5 cursor-pointer"
            onClick={sendMessageHandler}
          />
        </div>
      </form>
    </div>
  );
};

export default DashboardMessages;
