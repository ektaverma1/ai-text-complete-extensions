// Wrap the initialization in an IIFE
(function () {
  if (window.location.protocol.includes("http")) {
    console.log("AI Autocomplete: Starting initialization");

    let featureEnabled =
      localStorage.getItem("ai-autocomplete-enabled") !== "false";
    console.log("AI Autocomplete: Feature enabled:", featureEnabled);

    const initializeStyles = () => {
      if (document.head) {
        const style = document.createElement("style");
        style.textContent = `
          #ai-suggestion-overlay {
            position: absolute;
            font-family: inherit;
            background-color: rgba(250, 250, 250, 0.97);
            color: #888;
            padding: 0 4px;
            border-radius: 3px;
            pointer-events: none;
            z-index: 99999;
            display: inline-block !important;
            font-style: italic;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            border-left: 2px solid #4d8bfa;
            margin-left: 2px;
            transition: opacity 0.15s ease-in-out;
            overflow: hidden;
            max-width: 300px;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
          
          #ai-suggestion-overlay.active {
            color: #4d8bfa;
            font-weight: 500;
          }
          
          #ai-toggle-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: white;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            z-index: 2147483647; /* Maximum z-index value */
            cursor: pointer;
            opacity: 1; /* Always visible by default */
            transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
            border: none;
          }
          
          #ai-toggle-button:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }
          
          #ai-toggle-button.enabled {
            background-color: #4d8bfa;
          }
          
          #ai-toggle-button.enabled svg {
            stroke: white;
          }
          
          #ai-toggle-button.disabled svg {
            stroke: #888;
          }
          
          #ai-keyboard-hint {
            position: absolute;
            top: -24px;
            right: 0;
            background-color: #333;
            color: white;
            font-size: 11px;
            padding: 3px 6px;
            border-radius: 3px;
            opacity: 0;
            transform: translateY(5px);
            transition: all 0.2s ease-in-out;
            pointer-events: none;
          }
          
          #ai-suggestion-overlay:hover + #ai-keyboard-hint {
            opacity: 0.9;
            transform: translateY(0);
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          
          .pulse {
            animation: pulse 0.6s ease-in-out;
          }
          
          #ai-status-tooltip {
            position: absolute;
            bottom: 50px;
            right: 0;
            background-color: #333;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            opacity: 0;
            transition: opacity 0.2s;
            pointer-events: none;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
          }
        `;
        document.head.appendChild(style);
        console.log("AI Autocomplete: Styles initialized");
      }
    };

    // Initialize styles when document is ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initializeStyles);
    } else {
      initializeStyles();
    }

    console.log("AI Autocomplete: Enhanced content script loaded");

    // Create toggle button
    const createToggleButton = () => {
      // Remove any existing button first
      const existingButton = document.getElementById("ai-toggle-button");
      if (existingButton) {
        existingButton.remove();
      }

      console.log("AI Autocomplete: Creating toggle button");
      const button = document.createElement("button");
      button.id = "ai-toggle-button";
      button.className = featureEnabled ? "enabled" : "disabled";
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
        </svg>
        <div id="ai-status-tooltip">${
          featureEnabled ? "Disable" : "Enable"
        } autocomplete</div>
      `;
      document.body.appendChild(button);

      // Show tooltip on hover
      button.addEventListener("mouseenter", () => {
        const tooltip = document.getElementById("ai-status-tooltip");
        if (tooltip) {
          tooltip.style.opacity = "1";
        }
      });

      button.addEventListener("mouseleave", () => {
        const tooltip = document.getElementById("ai-status-tooltip");
        if (tooltip) {
          tooltip.style.opacity = "0";
        }
      });

      // Toggle feature when clicked
      button.addEventListener("click", () => {
        featureEnabled = !featureEnabled;
        localStorage.setItem("ai-autocomplete-enabled", featureEnabled);
        button.className = featureEnabled ? "enabled" : "disabled";
        button.classList.add("pulse");

        // Update tooltip text
        const tooltip = document.getElementById("ai-status-tooltip");
        if (tooltip) {
          tooltip.textContent = featureEnabled
            ? "Disable autocomplete"
            : "Enable autocomplete";
        }

        setTimeout(() => {
          button.classList.remove("pulse");
        }, 600);

        // Show feedback message
        showStatusMessage(
          featureEnabled
            ? "AI Autocomplete Enabled"
            : "AI Autocomplete Disabled"
        );

        console.log("AI Autocomplete: Feature toggled to", featureEnabled);
      });

      console.log(
        "AI Autocomplete: Toggle button created and appended to body"
      );
      return button;
    };

    // Show status message
    const showStatusMessage = (message) => {
      const existingMsg = document.getElementById("ai-status-message");
      if (existingMsg) {
        existingMsg.remove();
      }

      const statusMsg = document.createElement("div");
      statusMsg.id = "ai-status-message";
      statusMsg.textContent = message;
      statusMsg.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #333;
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        z-index: 2147483646;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        opacity: 0;
        transition: opacity 0.3s;
      `;
      document.body.appendChild(statusMsg);

      setTimeout(() => {
        statusMsg.style.opacity = "1";
        setTimeout(() => {
          statusMsg.style.opacity = "0";
          setTimeout(() => {
            statusMsg.remove();
          }, 300);
        }, 1500);
      }, 10);
    };

    // Track all editable elements
    const observeTextInputs = () => {
      console.log("AI Autocomplete: Observing text inputs");
      const textElements = document.querySelectorAll(
        'input[type="text"], input[type="search"], textarea, [contenteditable="true"]'
      );
      console.log("AI Autocomplete: Found text elements:", textElements.length);

      textElements.forEach((element) => {
        if (!element.dataset.aiObserved) {
          console.log(
            "AI Autocomplete: Adding listener to element",
            element.tagName
          );
          element.addEventListener("input", handleInput);
          element.addEventListener("focus", handleFocus);
          element.addEventListener("blur", handleBlur);
          element.dataset.aiObserved = "true";
        }
      });
    };

    // Active element tracking
    let activeElement = null;

    // Handle focus
    const handleFocus = (event) => {
      activeElement = event.target;
    };

    // Handle blur
    const handleBlur = (event) => {
      activeElement = null;
      removeOverlay();
    };

    // Handle input events
    const handleInput = async (event) => {
      if (!featureEnabled) {
        removeOverlay();
        return;
      }

      const element = event.target;
      const text = element.value || element.textContent || "";

      // Clear existing suggestion on backspace
      if (
        event.inputType === "deleteContentBackward" ||
        event.inputType === "deleteContentForward"
      ) {
        removeOverlay();
        return;
      }

      // Minimum text length check
      if (text.trim().length < 2) {
        removeOverlay();
        return;
      }

      // Debounce API calls
      if (element.timeout) {
        clearTimeout(element.timeout);
      }

      element.timeout = setTimeout(async () => {
        try {
          console.log("AI Autocomplete: Requesting completion for:", text);
          const response = await chrome.runtime.sendMessage({
            type: "getCompletion",
            text: text,
          });
          console.log("AI Autocomplete: Response from background:", response);

          if (response.error) {
            console.error(
              "AI Autocomplete: Error from background:",
              response.error
            );
            return;
          }

          let completion = response.completion;

          // Basic validation of completion
          if (typeof completion !== "string") {
            console.log(
              "AI Autocomplete: Invalid completion type received:",
              typeof completion
            );
            return;
          }

          completion = completion.trim();
          if (!completion) {
            console.log("AI Autocomplete: Empty completion received");
            return;
          }

          // Remove any repeated text from the beginning of the completion
          if (completion.toLowerCase().startsWith(text.toLowerCase())) {
            completion = completion.slice(text.length).trim();
          }

          if (!completion) {
            console.log(
              "AI Autocomplete: No valid completion after processing"
            );
            return;
          }

          console.log("AI Autocomplete: Showing completion:", completion);
          // Pass only the completion part
          showSuggestionOverlay(element, completion);

          // Add Tab handler for completion
          const handleTab = (e) => {
            if (e.key === "Tab") {
              e.preventDefault();
              e.stopPropagation();

              // Apply suggestion with animation
              const overlay = document.getElementById("ai-suggestion-overlay");
              if (overlay) {
                overlay.classList.add("active");
                setTimeout(() => {
                  if (element.value !== undefined) {
                    element.value = text + completion;
                  } else {
                    element.textContent = text + completion;
                  }

                  // Set cursor position to end
                  const newLength = (text + completion).length;
                  if (element.setSelectionRange) {
                    element.setSelectionRange(newLength, newLength);
                  }

                  // Clean up
                  removeOverlay();
                  // Dispatch input event to trigger change handlers
                  element.dispatchEvent(new Event("input", { bubbles: true }));
                }, 100);
              }

              element.removeEventListener("keydown", handleTab);
            } else if (e.key === "Escape") {
              // Dismiss suggestion on Escape
              removeOverlay();
              element.removeEventListener("keydown", handleTab);
            }
          };

          element.addEventListener("keydown", handleTab);
        } catch (error) {
          console.error("AI Autocomplete: Error in handleInput:", error);
        }
      }, 400);
    };

    // Helper function to remove overlay
    const removeOverlay = () => {
      const overlay = document.getElementById("ai-suggestion-overlay");
      if (overlay) overlay.remove();

      const keyboardHint = document.getElementById("ai-keyboard-hint");
      if (keyboardHint) keyboardHint.remove();
    };

    // Create and position the suggestion overlay
    const showSuggestionOverlay = (element, completionText) => {
      console.log("AI Autocomplete: Showing suggestion:", completionText);

      // Remove any existing overlay first
      removeOverlay();

      // Create new overlay
      const overlay = document.createElement("div");
      overlay.id = "ai-suggestion-overlay";
      document.body.appendChild(overlay);

      // Add keyboard hint
      const keyboardHint = document.createElement("div");
      keyboardHint.id = "ai-keyboard-hint";
      keyboardHint.textContent = "Press Tab to accept";
      document.body.appendChild(keyboardHint);

      const rect = element.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(element);

      // Calculate the text width up to cursor position
      const currentText = element.value || element.textContent || "";
      const cursorPosition = element.selectionStart || currentText.length;
      const textBeforeCursor = currentText.substring(0, cursorPosition);

      // Create temporary span to measure text width
      const span = document.createElement("span");
      span.style.font = computedStyle.font;
      span.style.fontSize = computedStyle.fontSize;
      span.style.fontFamily = computedStyle.fontFamily;
      span.style.fontWeight = computedStyle.fontWeight;
      span.style.letterSpacing = computedStyle.letterSpacing;
      span.style.textTransform = computedStyle.textTransform;
      span.style.visibility = "hidden";
      span.style.position = "absolute";
      span.style.whiteSpace = "pre"; // Preserve whitespace for accurate width
      span.textContent = textBeforeCursor;
      document.body.appendChild(span);

      const textWidth = span.getBoundingClientRect().width;
      document.body.removeChild(span);

      // Adjust for multiline input (like textarea)
      let lineHeight = parseInt(computedStyle.lineHeight);
      if (isNaN(lineHeight)) {
        lineHeight = parseInt(computedStyle.fontSize) * 1.2;
      }

      // Count newlines in text to determine line number
      const lines = textBeforeCursor.split("\n");
      const lineCount = lines.length - 1;
      const lastLineText = lines[lines.length - 1];

      // Create a span to measure only the last line text width
      const lastLineSpan = document.createElement("span");
      lastLineSpan.style.font = computedStyle.font;
      lastLineSpan.style.visibility = "hidden";
      lastLineSpan.style.position = "absolute";
      lastLineSpan.style.whiteSpace = "pre";
      lastLineSpan.textContent = lastLineText;
      document.body.appendChild(lastLineSpan);

      const lastLineWidth = lastLineSpan.getBoundingClientRect().width;
      document.body.removeChild(lastLineSpan);

      // Position and style the overlay
      overlay.style.position = "absolute";
      overlay.style.left = `${rect.left + lastLineWidth + window.scrollX}px`;
      overlay.style.top = `${
        rect.top + lineCount * lineHeight + window.scrollY
      }px`;
      overlay.style.font = computedStyle.font;
      overlay.style.fontSize = computedStyle.fontSize;
      overlay.style.lineHeight = computedStyle.lineHeight;
      overlay.style.fontFamily = computedStyle.fontFamily;
      overlay.style.whiteSpace = "pre"; // Preserve whitespace
      overlay.style.display = "inline-block"; // Ensure it's visible

      // Set the text (completionText is already just the completion part)
      overlay.textContent = completionText;

      // Position the keyboard hint near the overlay
      keyboardHint.style.position = "absolute";
      keyboardHint.style.left = `${
        rect.left + lastLineWidth + window.scrollX
      }px`;
      keyboardHint.style.top = `${
        rect.top + lineCount * lineHeight + window.scrollY - 24
      }px`;

      console.log("AI Autocomplete: Overlay positioned at:", {
        left: overlay.style.left,
        top: overlay.style.top,
        text: completionText,
        visible: overlay.style.display !== "none",
      });

      // Animate in
      overlay.style.opacity = "0";
      setTimeout(() => {
        overlay.style.opacity = "1";
      }, 10);
    };

    // Create toggle button function to ensure it gets created
    const ensureToggleButtonExists = () => {
      if (!document.getElementById("ai-toggle-button")) {
        createToggleButton();
      }
    };

    // Initialize immediately
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        console.log("AI Autocomplete: DOMContentLoaded event fired");
        observeTextInputs();
        createToggleButton();
      });
    } else {
      console.log(
        "AI Autocomplete: Document already loaded, initializing immediately"
      );
      observeTextInputs();
      createToggleButton();
    }

    // Handle dynamically added elements
    const observer = new MutationObserver((mutations) => {
      observeTextInputs();
      ensureToggleButtonExists();
    });

    // Wait for body to be available before observing
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
      // Create toggle button if not already created
      ensureToggleButtonExists();
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });
        ensureToggleButtonExists();
      });
    }

    // Add listener for keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      // Alt+Shift+A to toggle feature
      if (e.altKey && e.shiftKey && e.key === "A") {
        featureEnabled = !featureEnabled;
        localStorage.setItem("ai-autocomplete-enabled", featureEnabled);

        const button = document.getElementById("ai-toggle-button");
        if (button) {
          button.className = featureEnabled ? "enabled" : "disabled";
          button.classList.add("pulse");
          setTimeout(() => {
            button.classList.remove("pulse");
          }, 600);
        }

        // Update tooltip text
        const tooltip = document.getElementById("ai-status-tooltip");
        if (tooltip) {
          tooltip.textContent = featureEnabled
            ? "Disable autocomplete"
            : "Enable autocomplete";
        }

        // Show status message
        showStatusMessage(
          featureEnabled
            ? "AI Autocomplete Enabled"
            : "AI Autocomplete Disabled"
        );
      }
    });

    // Force button creation after a small delay as a fallback
    setTimeout(() => {
      ensureToggleButtonExists();
      console.log("AI Autocomplete: Delayed toggle button creation check");
    }, 1000);

    console.log("AI Autocomplete: Initialization complete");
  }
})();
