document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Element References ---
  const book = document.getElementById("book");
  const bookCover = document.getElementById("book-cover");
  const closeButton = document.getElementById("close-button");
  const tocList = document.getElementById("toc-list");
  const chapters = document.querySelectorAll(".chapter");
  const tocItems = document.querySelectorAll(".toc-item");
  const bookMain = document.getElementById("book-main");
  const mediaQuery = window.matchMedia("(min-width: 769px)"); // Media query for desktop view

  // --- Book Open/Close Logic ---

  /**
   * Opens the book with 3D effect on desktop.
   */
  function openBook() {
    // Only apply 3D effect on larger screens
    if (mediaQuery.matches && !book.classList.contains("open")) {
      book.classList.add("open");
      closeButton.classList.add("visible"); // Make close button appear (handles its own transition)
    }
  }

  /**
   * Closes the book with 3D effect on desktop.
   */
  function closeBook() {
    if (mediaQuery.matches && book.classList.contains("open")) {
      book.classList.remove("open");
      closeButton.classList.remove("visible"); // Hide close button

      // Temporarily disable pointer events on the book container during closing transition
      // to prevent accidental clicks or re-opening before it finishes.
      book.style.pointerEvents = "none";

      // Re-enable pointer events after the CSS transition completes.
      // Match timeout duration to CSS transition (1.25s = 1250ms). Added small buffer.
      const transitionDuration = 1250; // ms
      const buffer = 50; // ms
      setTimeout(() => {
        // Check if the book is still closed before re-enabling pointer events
        // (handles cases where it might be opened again quickly somehow)
        if (!book.classList.contains("open")) {
          book.style.pointerEvents = "auto";
        }
      }, transitionDuration + buffer);
    }
  }

  // Event listener for clicking the book cover to open
  if (bookCover) {
    bookCover.addEventListener("click", openBook);
  }

  // Event listener for the close button
  if (closeButton) {
    closeButton.addEventListener("click", closeBook);
  }

  // Event listener for the Escape key to close the book
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeBook(); // closeBook function already checks if book is open and media query matches
    }
  });

  // --- Chapter Navigation Logic ---

  /**
   * Switches the active chapter based on chapter ID.
   * @param {string} chapterId - The ID of the chapter to activate.
   */
  function setActiveChapter(chapterId) {
    if (!chapterId) return;

    const newChapter = document.getElementById(chapterId);
    // Find the corresponding TOC item using the data-chapter attribute
    const newTocItem = tocList.querySelector(
      `.toc-item[data-chapter="${chapterId}"]`
    );

    if (!newChapter || !newTocItem) {
      console.error(`Chapter or TOC item for id "${chapterId}" not found.`);
      return;
    }

    // Remove 'active' class from current active item and chapter
    const currentActiveItem = tocList.querySelector(".toc-item.active");
    const currentActiveChapter = document.querySelector(".chapter.active");

    if (currentActiveItem) currentActiveItem.classList.remove("active");
    if (currentActiveChapter) currentActiveChapter.classList.remove("active");

    // Add 'active' class to the new item and chapter
    newTocItem.classList.add("active");
    newChapter.classList.add("active");

    // Scroll the main content area to the top smoothly
    if (bookMain) {
      bookMain.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // Event listener for clicks within the Table of Contents (uses event delegation)
  if (tocList) {
    tocList.addEventListener("click", (event) => {
      const targetItem = event.target.closest(".toc-item"); // Find the nearest .toc-item ancestor

      // Exit if click wasn't on a toc-item or if it's already active
      if (!targetItem || targetItem.classList.contains("active")) {
        return;
      }

      const chapterId = targetItem.getAttribute("data-chapter");
      setActiveChapter(chapterId);
    });
  }

  // --- Page Navigation Button Logic ---

  // **Next Page Button Logic**
  const nextPageButtons = document.querySelectorAll(".next-page-button");
  if (nextPageButtons.length > 0) {
    nextPageButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent potential default button behavior

        const currentTocItem = tocList.querySelector(".toc-item.active");
        if (!currentTocItem) return; // Should not happen, but safety check

        // Find the *next* list item (LI element) in the TOC
        const nextTocItem = currentTocItem.nextElementSibling;

        // If there is a next item and it's a toc-item, get its chapter ID and activate it
        if (nextTocItem && nextTocItem.classList.contains("toc-item")) {
          const nextChapterId = nextTocItem.getAttribute("data-chapter");
          setActiveChapter(nextChapterId);
        }
        // If no next sibling, we are on the last chapter, do nothing.
      });
    });
  }

  // **Previous Page Button Logic**
  const prevPageButtons = document.querySelectorAll(".prev-page-button");
  if (prevPageButtons.length > 0) {
    prevPageButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        const currentTocItem = tocList.querySelector(".toc-item.active");
        if (!currentTocItem) return;

        // Find the *previous* list item (LI element) in the TOC
        const prevTocItem = currentTocItem.previousElementSibling;

        // If there is a previous item and it's a toc-item, get its chapter ID and activate it
        if (prevTocItem && prevTocItem.classList.contains("toc-item")) {
          const prevChapterId = prevTocItem.getAttribute("data-chapter");
          setActiveChapter(prevChapterId);
        }
        // If no previous sibling, we are on the first chapter, do nothing.
      });
    });
  }

  // --- Responsive Handling ---

  /**
   * Adjusts book state based on screen size changes.
   * Removes 3D 'open' state on small screens, restores button visibility on large screens if needed.
   */
  function handleResponsiveView() {
    // If screen becomes small (mobile/tablet):
    if (!mediaQuery.matches) {
      // If the book was open in 3D view, force it closed (visually flat now due to CSS)
      // and ensure the close button is hidden.
      if (book.classList.contains("open")) {
        book.classList.remove("open");
      }
      if (closeButton.classList.contains("visible")) {
        closeButton.classList.remove("visible");
      }
      // Ensure pointer events are reset if switching to mobile while closing animation was running
      book.style.pointerEvents = "auto";
    }
    // If screen becomes large (desktop):
    else {
      // Ensure the close button visibility matches the book's open state
      if (book.classList.contains("open")) {
        closeButton.classList.add("visible");
      } else {
        closeButton.classList.remove("visible");
      }
    }
  }

  // Initial check on page load
  handleResponsiveView();

  // Listen for changes in screen size (browser resize, orientation change)
  mediaQuery.addEventListener("change", handleResponsiveView);
}); // End DOMContentLoaded
