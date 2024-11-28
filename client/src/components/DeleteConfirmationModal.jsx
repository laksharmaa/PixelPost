import React from "react";
import ReactDOM from "react-dom";
import {
  Button,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";

export const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  const handleBackgroundClick = (event) => {
    // Close modal if clicking outside the modal content
    if (event.target.classList.contains("modal-backdrop")) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackgroundClick}
    >
      {/* Modal Content */}
      <div className="relative z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm">
        <DialogHeader className="text-lg font-bold text-gray-900 dark:text-white">
          Confirm Delete
        </DialogHeader>
        <DialogBody className="text-gray-700 dark:text-gray-300 text-sm">
          Are you sure you want to delete this post? This action cannot be undone.
        </DialogBody>
        <DialogFooter className="flex justify-end gap-4">
          <Button
            variant="text"
            color="green"
            onClick={onClose}
            className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-all"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="gradient"
            color="red"
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-lg px-4 py-2 transition-all"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </div>
    </div>,
    document.body
  );
};