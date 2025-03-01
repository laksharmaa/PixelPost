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
import { useUser } from "../context/UserContext";

const CreatePost = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const { user: currentUser } = useUser();

  const [form, setForm] = useState({
    name: "",
    prompt: "",
    photo: "",
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

  const generateImage = async () => {
    if (form.prompt) {
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
          });
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.message || "Failed to generate image"}`);
        }
      } catch (error) {
        alert(`Error generating image: ${error.message}`);
      } finally {
        setGeneratingImg(false);
      }
    } else {
      alert("Please enter a prompt");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
              ...form,
              userId: user.sub,
              username: currentUser?.username || "anonymous",
            }),
          }
        );

        if (response.ok) {
          navigate("/");
        } else {
          const errorData = await response.json();
          alert(`Error sharing post: ${errorData.message}`);
        }
      } catch (err) {
        alert(`Error sharing post: ${err.message}`);
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please enter a prompt and generate an image");
    }
  };

  const handleSurpriseMe = () => {
    const randomPrompt = getRandomPrompt(form.prompt);
    setForm({ ...form, prompt: randomPrompt });
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText min-h-screen p-8 rounded-xl"
    >
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
        </motion.div>

        <motion.div
          className="mt-5 flex gap-5"
          // whileHover={{ scale: 1.02 }}
        >
          <GenerateButton onClick={generateImage} generating={generatingImg} />
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
          >
            {loading ? "Sharing..." : "Share with the community"}
          </motion.button>
        </motion.div>
      </form>
    </motion.section>
  );
};

export default CreatePost;
