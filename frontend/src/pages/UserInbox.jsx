import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { AiOutlineArrowRight, AiOutlineSend } from "react-icons/ai";
import { TfiGallery } from "react-icons/tfi";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { format } from "timeago.js";
import Header from "../components/Layout/Header";
import { UserAvatar, ProductImage } from "../components/common/EnhancedImage";
import styles from "../styles/styles";

const BASE_URL = window.RUNTIME_CONFIG.API_URL;

const UserInbox = () => {
  const { user } = useSelector((state) => state.user);
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeStatus, setActiveStatus] = useState(false);
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const scrollRef = useRef(null);

  // Load conversations
  useEffect(() => {
    const getConversations = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/conversation/get-all-conversation/${user?._id}`,
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

    if (user) {
      getConversations();
    }
  }, [user]);

  // Get messages for current chat
  useEffect(() => {
    const getMessage = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/message/get-all-messages/${currentChat?._id}`,
          {
            withCredentials: true,
          }
        );
        setMessages(response.data.messages);
      } catch (error) {
        console.log(error);
      }
    };
    if (currentChat) {
      getMessage();
    }
  }, [currentChat]);

  // Create new message (HTTP-only, no Socket.IO)
  const sendMessageHandler = async (e) => {
    e.preventDefault();

    const message = {
      sender: user._id,
      text: newMessage,
      conversationId: currentChat._id,
    };

    try {
      if (newMessage !== "") {
        const response = await axios.post(
          `${BASE_URL}/message/create-new-message`, 
          message,
          {
            withCredentials: true,
          }
        );
        setMessages([...messages, response.data.message]);
        updateLastMessage();
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to send message");
    }
  };

  const updateLastMessage = async () => {
    try {
      await axios.put(
        `${BASE_URL}/conversation/update-last-message/${currentChat._id}`, 
        {
          lastMessage: newMessage,
          lastMessageId: user._id,
        },
        {
          withCredentials: true,
        }
      );
      setNewMessage("");
    } catch (error) {
      console.log(error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    imageSendingHandler(file);
  };

  const imageSendingHandler = async (file) => {
    const formData = new FormData();

    formData.append("images", file);
    formData.append("sender", user._id);
    formData.append("text", newMessage);
    formData.append("conversationId", currentChat._id);

    try {
      const response = await axios.post(
        `${BASE_URL}/message/create-new-message`, 
        formData, 
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      setMessages([...messages, response.data.message]);
      updateLastMessageForImage();
    } catch (error) {
      console.log(error);
      toast.error("Failed to send image");
    }
  };

  const updateLastMessageForImage = async () => {
    try {
      await axios.put(
        `${BASE_URL}/conversation/update-last-message/${currentChat._id}`,
        {
          lastMessage: "Photo",
          lastMessageId: user._id,
        },
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  // Simple online check (since we don't have real-time Socket.IO data)
  const onlineCheck = (chat) => {
    // Without Socket.IO, we can't determine real-time online status
    // Return false for now, or implement a periodic HTTP check if needed
    return false;
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ beahaviour: "smooth" });
  }, [messages]);

  return (
    <div className="w-full">
      {!open && (
        <>
          <Header />
          <h1 className="text-center text-[30px] py-3 font-Poppins">
            All Messages
          </h1>
          {/* All messages list */}
          {conversations &&
            conversations.map((item, index) => (
              <MessageList
                data={item}
                key={index}
                index={index}
                setOpen={setOpen}
                setCurrentChat={setCurrentChat}
                me={user?._id}
                setUserData={setUserData}
                userData={userData}
                online={onlineCheck(item)}
                setActiveStatus={setActiveStatus}
              />
            ))}
        </>
      )}

      {open && (
        <SellerInbox
          setOpen={setOpen}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessageHandler={sendMessageHandler}
          messages={messages}
          sellerId={user._id}
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
  const [user, setUser] = useState([]);
  const navigate = useNavigate();
  const handleClick = (id) => {
    navigate(`/inbox?${id}`);
    setOpen(true);
  };

  useEffect(() => {
    setActiveStatus(online);
    const userId = data.members.find((user) => user !== me);
    const getUser = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/shop/get-shop-info/${userId}`);

        setUser(res.data.shop);
      } catch (error) {
        console.log(error);
      }
    };
    getUser();
  }, [me, data, online, setActiveStatus]);

  return (
    <div
      className={`w-full flex p-3 px-3 ${
        active === index ? "bg-[#00000010]" : "bg-transparent"
      }  cursor-pointer`}
      onClick={(e) =>
        setActive(index) ||
        handleClick(data._id) ||
        setCurrentChat(data) ||
        setUserData(user) ||
        setActiveStatus(online)
      }
    >
      <div className="relative">
        <UserAvatar
          user={userData}
          className="w-[50px] h-[50px] rounded-full"
          size="50"
        />
        {online ? (
          <div className="w-[12px] h-[12px] bg-green-400 rounded-full absolute top-[2px] right-[2px]" />
        ) : (
          <div className="w-[12px] h-[12px] bg-[#c7b9b9] rounded-full absolute top-[2px] right-[2px]" />
        )}
      </div>
      <div className="pl-3">
        <h1 className="text-[18px]">{userData?.name}</h1>
        <p className="text-[16px] text-[#000c]">
          {data?.lastMessageId !== userData?._id
            ? "You:"
            : userData?.name.split(" ")[0] + ": "}{" "}
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
    <div className="w-[full] min-h-full flex flex-col justify-between p-5">
      {/* message header */}
      <div className="w-full flex p-3 items-center justify-between bg-slate-200">
        <div className="flex">
          <UserAvatar
            user={userData}
            className="w-[60px] h-[60px] rounded-full"
            size="60"
          />
          <div className="pl-3">
            <h1 className="text-[18px] font-[600]">{userData?.name}</h1>
            <h1>{activeStatus ? "Active Now" : ""}</h1>
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
        {messages &&
          messages.map((item, index) => (
            <div
              key={index}
              className={`flex w-full my-2 ${
                item.sender === sellerId ? "justify-end" : "justify-start"
              }`}
              ref={scrollRef}
            >
              {item.sender !== sellerId && (
                <UserAvatar
                  user={userData}
                  className="w-[40px] h-[40px] rounded-full mr-3"
                  size="40"
                />
              )}
              {item.images && (
                <ProductImage
                  src={item.images}
                  className="w-[300px] h-[300px] object-cover rounded-[10px] ml-2 mb-2"
                  alt="Message attachment"
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
      <form
        className="p-3 relative w-full flex justify-between items-center"
        onSubmit={sendMessageHandler}
      >
        <div className="w-[30px]">
          <input
            type="file"
            name=""
            id="image"
            className="hidden"
            onChange={handleImageUpload}
          />
          <label htmlFor="image">
            <TfiGallery className="cursor-pointer" size={20} />
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
          <input type="submit" value="Send" className="hidden" id="send" />
          <label htmlFor="send">
            <AiOutlineSend
              size={20}
              className="absolute right-4 top-5 cursor-pointer"
            />
          </label>
        </div>
      </form>
    </div>
  );
};

export default UserInbox;
