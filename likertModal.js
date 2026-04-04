"use strict"
        

        /**
         * Placeholder function to handle the recorded score
         */
        function recordedLikert(score) 
            {
            console.log("Recorded Likert Score:", score);
            }

        /**
         * Creates and injects the modal into the DOM
         */
        function showLikertModal({training = false}) 
            {
            if (training)
                {
                recordedLikert("-1");
                return; // don't show likert while training
                }
            // 1. Create Modal Background
            const modal = document.createElement('div');
            modal.id = 'likert-modal';

            // 2. Create Modal Content
            modal.innerHTML = `
                <div class="modal-content">
                    <h2>How much did you like to use this table?</h2>
                    
                    <div class="labels">
                        <span>Not at all</span>
                        <span>Neutral</span>
                        <span>Very much</span>
                    </div>

                    <div class="likert-container">
                        ${[1, 2, 3, 4, 5, 6, 7].map(num => `
                            <label class="likert-option">
                                <input type="radio" name="likert" value="${num}">
                                ${num}
                            </label>
                        `).join('')}
                    </div>

                    <button id="submit-btn" disabled>Submit and continue</button>
                </div>
            `;

            document.body.appendChild(modal);

            const submitBtn = modal.querySelector('#submit-btn');
            const radios = modal.querySelectorAll('input[name="likert"]');

            // 3. Enable button only when a selection is made
            radios.forEach(radio => {
                radio.addEventListener('change', () => {
                    submitBtn.disabled = false;
                });
            });

            // 4. Handle Submit
            submitBtn.addEventListener('click', () => {
                const selectedValue = modal.querySelector('input[name="likert"]:checked').value;
                
                // Call the processing function
                recordedLikert(selectedValue);
                
                // Close/Remove the modal
                modal.remove();
            });
        }