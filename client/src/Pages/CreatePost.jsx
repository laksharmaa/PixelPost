import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { motion, AnimatePresence } from "framer-motion";
import preview from "../assets/preview.png";
import { getRandomPrompt } from "../utils";
import { FormField, Loader } from "../components";
import GenerateButton from "../components/GenerateButton";
import CreatePostStepper from "../components/CreatePostStepper";
import PromptCarousel from "../components/PromptCarousel";
import ErrorPopup from "../components/ErrorPopup";
import { useUser } from "../context/UserContext";
import { RiCoinLine } from "react-icons/ri";

const CreatePost = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const { user: currentUser, fetchUserData } = useUser();

  const [error, setError] = useState({
    isVisible: false,
    message: "",
    type: "error",
  });

  const [form, setForm] = useState({
    name: "",
    prompt: "",
    photo: "",
    tags: [],
  });

  const [generatingImg, setGeneratingImg] = useState(false);
  const [loading, setLoading] = useState(false);

  // Update step based on form progress
  useEffect(() => {
    if (form.name) setCurrentStep(2);
    if (form.prompt) setCurrentStep(3);
    if (form.photo) setCurrentStep(4);
  }, [form]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePromptSelect = (selectedPrompt) => {
    setForm({ ...form, prompt: selectedPrompt });
  };

  const showError = (message, type = "error") => {
    setError({
      isVisible: true,
      message,
      type,
    });
  };

  // Close error popup
  const closeError = () => {
    setError({
      isVisible: false,
      message: "",
      type: "error",
    });
  };

  const generateImage = async () => {
    if (!form.prompt) {
      showError("Please enter a prompt", "warning");
      return;
    }
    
    // Check if user has enough credits
    if (!currentUser || currentUser.credits < 1) {
      showError("You don't have enough credits to generate an image. Each generation costs 1 credit.", "warning");
      return;
    }
  
    try {
      setGeneratingImg(true);
      const token = await getAccessTokenSilently();
  
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/dalle`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ prompt: form.prompt }),
        }
      );
  
      if (response.ok) {
        const data = await response.json();
        setForm({
          ...form,
          photo: `data:image/jpeg;base64,${data.photo.trim()}`,
          tags: data.tags || [],
        });
        
        // Update user credit count from API response
        if (fetchUserData && typeof fetchUserData === 'function') {
          await fetchUserData();
        }
        
        console.log("Tags received:", data.tags);
      } else {
        const errorData = await response.json();
        showError(errorData.message || "Failed to generate image");
      }
    } catch (error) {
      showError(`Error generating image: ${error.message}`);
    } finally {
      setGeneratingImg(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name) {
      showError("Please give your creation a title", "warning");
      return;
    }

    if (form.prompt && form.photo) {
      setLoading(true);
      try {
        const token = await getAccessTokenSilently();

        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/v1/post`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: form.name,
              prompt: form.prompt,
              photo: form.photo,
              userId: user.sub,
              username: currentUser?.username || "anonymous",
              tags: form.tags,
            }),
          }
        );

        if (response.ok) {
          navigate("/");
        } else {
          const errorData = await response.json();
          showError(`Error sharing post: ${errorData.message}`);
        }
      } catch (err) {
        showError(`Error sharing post: ${err.message}`);
      } finally {
        setLoading(false);
      }
    } else {
      showError("Please enter a prompt and generate an image", "warning");
    }
  };

  const handleSurpriseMe = () => {
    const randomPrompt = getRandomPrompt(form.prompt);
    setForm({ ...form, prompt: randomPrompt });
  };

  // Optional: Display tags for user to see/edit (if you want to add this feature)
  const renderTags = () => {
    if (form.tags && form.tags.length > 0) {
      return (
        <div className="mt-3">
          <p className="text-sm font-medium mb-2">Generated Tags:</p>
          <div className="flex flex-wrap gap-2">
            {form.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText min-h-screen p-8 rounded-xl"
    >
      <ErrorPopup
        isVisible={error.isVisible}
        message={error.message}
        type={error.type}
        onClose={closeError}
      />
      <CreatePostStepper currentStep={currentStep} />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="font-extrabold text-[32px]">Create Your AI Art</h1>
        <p className="mt-2 text-[#6b7280] dark:text-[#d1d5db] text-[14px] max-w-[500px]">
          Transform your ideas into stunning AI-generated artwork and share them
          with the community.
        </p>
        
        {/* Credits Display */}
        <div className="mt-4 flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
          <RiCoinLine className="text-yellow-500" size={20} />
          <p className="text-sm font-medium">
            Credits: <span className="font-bold">{currentUser?.credits || 0}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              (1 credit per generation)
            </span>
          </p>
        </div>
      </motion.div>

      <form className="mt-16 max-w-3xl" onSubmit={handleSubmit}>
        <motion.div
          className="flex flex-col gap-5"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <FormField
            labelName="Title of your post"
            type="text"
            name="name"
            placeholder="Give your creation a title"
            value={form.name}
            handleChange={handleChange}
          />

          <div>
            <label className="block text-sm font-medium mb-2">
              Need inspiration? Try these prompts:
            </label>
            <PromptCarousel onSelect={handlePromptSelect} />
          </div>

          <FormField
            labelName="Prompt"
            type="text"
            name="prompt"
            placeholder="Enter your creative prompt here"
            value={form.prompt}
            handleChange={handleChange}
            isSurpriseMe
            handleSurpriseMe={handleSurpriseMe}
          />

          <motion.div
            className="relative bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-64 p-3 h-64 flex justify-center items-center"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            {form.photo ? (
              <img
                src={form.photo}
                alt={form.prompt}
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={preview}
                alt="preview"
                className="w-9/12 h-9/12 object-contain opacity-40"
              />
            )}

            {generatingImg && (
              <motion.div
                className="absolute inset-0 z-0 flex justify-center items-center bg-[rgba(0,0,0,0.5)] rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Loader />
              </motion.div>
            )}
          </motion.div>

          {renderTags()}
        </motion.div>

        <motion.div className="mt-5 flex items-center gap-3">
          <GenerateButton 
            onClick={generateImage} 
            generating={generatingImg} 
            credits={currentUser?.credits || 0}
          />
          {currentUser?.credits < 1 && 
            <p className="text-red-500 text-sm">Not enough credits</p>
          }
        </motion.div>

        <motion.div
          className="mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="mt-2 text-[#6b7280] dark:text-[#d1d5db] text-[14px]">
            Once you've created your masterpiece, share it with the community!
          </p>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-3 text-white bg-[#6469ff] font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5 text-center"
            disabled={loading}
          >
            {loading ? "Sharing..." : "Share with the community"}
          </motion.button>
        </motion.div>
      </form>
    </motion.section>
  );
};

export default CreatePost;
