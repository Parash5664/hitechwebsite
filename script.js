// -------------------- SLIDER LOGIC --------------------
let slideIndex = 0;
let slideTimer;

function showSlides() {
  const slides = document.getElementsByClassName("slides");
  const dots = document.getElementsByClassName("dot");
  if (slides.length === 0) return;

  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }

  slideIndex++;
  if (slideIndex > slides.length) { slideIndex = 1; }

  for (let i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active-dot", "");
  }

  slides[slideIndex - 1].style.display = "block";
  if (dots[slideIndex - 1]) dots[slideIndex - 1].className += " active-dot";

  slideTimer = setTimeout(showSlides, 5000);
}

function plusSlides(n) {
  clearTimeout(slideTimer);
  slideIndex += n - 1;
  showSlides();
}

function currentSlide(n) {
  clearTimeout(slideTimer);
  slideIndex = n - 1;
  showSlides();
}

// -------------------- DOM READY --------------------
document.addEventListener("DOMContentLoaded", function () {
  showSlides();

  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      const expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!expanded));
      mainNav.classList.toggle('open');
    });

    // Close nav when clicking a link (mobile)
    const navLinks = document.querySelectorAll('.navmenu a');
    navLinks.forEach(link => link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }));
  }

  // Scroll Up button
  const scrollUpBtn = document.getElementById("scrollUpBtn") || document.querySelector('.scroll-up');
  function scrollFunction() {
    if (!scrollUpBtn) return;
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
      scrollUpBtn.style.display = "block";
    } else {
      scrollUpBtn.style.display = "none";
    }
  }
  window.addEventListener('scroll', scrollFunction);
  if (scrollUpBtn) {
    scrollUpBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Keyboard accessibility for slider
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') plusSlides(-1);
    if (e.key === 'ArrowRight') plusSlides(1);
  });
});

// -------------------- GEMINI CHATBOT --------------------
const API_KEY = "AIzaSyB5tCUgEU-VrJeXfIgqsz9qHVkat8C5lmw";

document.addEventListener("DOMContentLoaded", () => {
  const chatBtn = document.getElementById("chatbot-btn");
  const chatBox = document.getElementById("chatbot-box");
  const sendBtn = document.getElementById("chatbot-send");
  const input = document.getElementById("chatbot-input");
  const messages = document.getElementById("chatbot-messages");

  if (!chatBtn || !chatBox || !sendBtn || !input || !messages) {
    console.error("Chatbot elements not found in the DOM.");
    return;
  }

  // Toggle chat visibility
  chatBtn.addEventListener("click", () => {
    chatBox.style.display = chatBox.style.display === "flex" ? "none" : "flex";
  });

  // Function to append messages
  function appendMessage(content, className) {
    const msg = document.createElement("div");
    msg.className = `chatbot-msg ${className}`;
    msg.textContent = content;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  // Send message function
  async function sendMessage() {
    const userInput = input.value.trim();
    if (!userInput) return;
    appendMessage(userInput, "chatbot-user");
    input.value = "";

    appendMessage("Typing...", "chatbot-bot");

    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + API_KEY,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userInput }] }]
          })
        }
      );

      const data = await response.json();
      console.log("Gemini API response:", data);

      let botReply = "Sorry, I couldn't get that.";
      try {
        const candidate = data?.candidates?.[0];
        if (candidate?.content?.parts?.[0]?.text) {
          botReply = candidate.content.parts[0].text;
        } else if (candidate?.output_text) {
          botReply = candidate.output_text;
        } else if (data?.promptFeedback?.safetyRatings) {
          botReply = "I'm sorry, but I can't answer that safely.";
        }
      } catch (err) {
        console.error("Parsing error:", err);
        botReply = "There was a problem reading the AI response.";
      }

      messages.lastChild.textContent = botReply;
    } catch (error) {
      console.error("Fetch error:", error);
      messages.lastChild.textContent = "Error fetching response.";
    }
  }

  // Event listeners
  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keypress", e => {
    if (e.key === "Enter") sendMessage();
  });
});
