const VoiceAI = {
    init(dbDevices, backendAnalysis) {
        const btn = document.getElementById('voice-btn');
        const box = document.getElementById('voice-transcript-box');
        
        if (!btn || !box) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            btn.onclick = () => {
                box.innerText = "Voice API disabled. Browser environment unsupported.";
                box.classList.remove('hidden');
                setTimeout(() => box.classList.add('hidden'), 3000);
            };
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN';

        btn.onclick = () => {
            box.innerText = "WattSense AI Core: Listening...";
            box.classList.remove('hidden');
            btn.classList.add('active');
            recognition.start();
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            console.log("Transcribed Audio: " + transcript);
            
            // Dynamic LLM-style decision tree operating on LIVE DB DATA.
            if (transcript.includes('save') || transcript.includes('energy') || transcript.includes('leak') || transcript.includes('worst')) {
                let aiResponseText = "";
                
                const active = dbDevices.filter(d => d.pluggedIn);
                if(active.length === 0) {
                    aiResponseText = "Your grid is fully mitigated. There are no active energy vampires detected by the database.";
                } else {
                    const vampire = active.reduce((prev, cur) => prev.standbyPowerW > cur.standbyPowerW ? prev : cur);
                    const cost = Math.round(((vampire.standbyPowerW * 24 * 365) / 1000) * 8.0);
                    
                    // The core interaction: Read exactly what Python parsed.
                    aiResponseText = `I have analyzed the database. ${backendAnalysis.insight} To be precise, unplugging your ${vampire.name} in the ${vampire.room} will save ₹${cost} annually.`;
                }

                box.innerHTML = `<strong>WattSense AI:</strong> "${aiResponseText}"`;
                
                // Literally speak the output aloud natively
                const utterance = new SpeechSynthesisUtterance(aiResponseText);
                utterance.voice = speechSynthesis.getVoices().find(v => v.lang.includes('en-IN')) || null;
                speechSynthesis.speak(utterance);
            } else {
                box.innerText = `You said: "${transcript}". Ask about energy leaks or the master grid!`;
            }
            
            btn.classList.remove('active');
            setTimeout(() => box.classList.add('hidden'), 8000);
        };

        recognition.onerror = () => {
            box.innerText = "Microphone error or speech not recognized.";
            btn.classList.remove('active');
            setTimeout(() => box.classList.add('hidden'), 3000);
        };
    }
};
