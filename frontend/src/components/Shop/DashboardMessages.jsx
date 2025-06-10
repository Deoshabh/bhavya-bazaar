import { useEffect, useRef, useState } from "react";
import { AiOutlineArrowRight, AiOutlineSend } from "react-icons/ai";
import { TfiGallery } from "react-icons/tfi";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import axios from "axios";
import { UserAvatar, ProductImage } from "../common/EnhancedImage";
import { format } from "timeago.js";
import styles from "../../styles/styles";

const DashboardMessages = () => {
  const { seller } = useSelector((state) => state.seller);
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userData, setUserData] = useState(null);
  const [activeStatus, setActiveStatus] = useState(false);
  const [open, setOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const scrollRef = useRef(null);

  // Get API URL from runtime config
  const apiUrl = window.RUNTIME_CONFIG?.API_URL;

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

  useEffect(() => {
    const getMessages = async () => {
      if (!currentChat?._id) return;
      
      try {
        const response = await axios.get(
          `${apiUrl}/message/get-all-messages/${currentChat._id}`,
          {
            withCredentials: true,
          }
        );
        setMessages(response.data.messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load messages");
      }
    };
    
    getMessages();
  }, [currentChat, apiUrl]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(file);
      imageSendingHandler(file);
    }
  };

    const imageSendingHandler = async (file) => {
    try {
      if (!seller?._id) {
        console.error("Seller ID not available");
        toast.error("Unable to send message - seller not authenticated");
        return;
      }

      const formData = new FormData();
      formData.append("images", file);
      formData.append("sender", seller._id);
      formData.append("text", newMessage);
      formData.append("conversationId", currentChat._id);

      const { data } = await axios.post(
        `${window.RUNTIME_CONFIG.API_URL}/message/create-new-message`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
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

    if (!seller?._id) {
      console.error("Seller ID not available");
      toast.error("Unable to send message - seller not authenticated");
      return;
    }

    try {
      const { data } = await axios.post(`${window.RUNTIME_CONFIG.API_URL}/message/create-new-message`, {
        sender: seller._id,
        text: newMessage,
        conversationId: currentChat._id,
      }, {
        withCredentials: true,
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
    if (!seller?._id) {
      console.error("Seller ID not available for updating last message");
      return;
    }

    try {
      await axios.put(
        `${apiUrl}/conversation/update-last-message/${currentChat._id}`,
        {
          lastMessage: newMessage,
          lastMessageId: seller._id,
        },
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error("Error updating last message:", error);
    }
  };

  const updateLastMessageForImage = async () => {
    if (!seller?._id) {
      console.error("Seller ID not available for updating last message");
      return;
    }

    try {
      await axios.put(
        `${apiUrl}/conversation/update-last-message/${currentChat._id}`,
        {
          lastMessage: "Photo",
          lastMessageId: seller._id,
        },
        {
          withCredentials: true,
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
              online={false}
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
          `${window.RUNTIME_CONFIG?.API_URL || process.env.REACT_APP_API_URL}/shop/get-shop-info/${userId}`,
          {
            withCredentials: true,
          }
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
        <UserAvatar
          user={userData}
          className="w-[50px] h-[50px] rounded-full"
          size="50"
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
          <UserAvatar
            src={userData?.avatar}
            userName={userData?.name}
            className="w-[60px] h-[60px] rounded-full"
            size="60"
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
              <UserAvatar
                src={userData?.avatar}
                userName={userData?.name}
                className="w-[40px] h-[40px] rounded-full mr-3"
                size="40"
              />
            )}
            {item.images && (
              <ProductImage
                src={item.images}
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
