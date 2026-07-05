document.addEventListener('DOMContentLoaded', () => {
    

    const searchForm = document.querySelector('.search-bar'); 
    
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            const input = searchForm.querySelector('input');
            const query = input.value.trim();

            if (query) {
                alert(`Searching for: "${query}"...\n(This is a demo feature. In a real backend, this would filter results.)`);
                input.value = ''; 
            } else {
                alert("Please enter a keyword to search.");
            }
        });

        const searchBtn = searchForm.querySelector('button');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                searchForm.dispatchEvent(new Event('submit'));
            });
        }
    }

    const footerParagraph = document.querySelector('footer p');
    if (footerParagraph) {
        const currentYear = new Date().getFullYear();
        footerParagraph.innerHTML = `&copy; ${currentYear} HM Sports. All rights reserved.`;
    }
    
    const categoryCards = document.querySelectorAll('.category-card');
    
    if (categoryCards.length > 0) {
        categoryCards.forEach(card => {
            card.style.cursor = 'pointer';
            
            card.addEventListener('click', () => {
                const categoryName = card.innerText.trim();
                const confirmShop = confirm(`Do you want to browse ${categoryName}?`);
                if (confirmShop) {
                    window.location.href = 'products.html';
                }
            });
        });
    }


    const buyButtons = document.querySelectorAll('.buy-button');

    if (buyButtons.length > 0) {
        buyButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const card = button.closest('.product-card');
                const title = card.querySelector('h3').innerText;
                const price = card.querySelector('.price').innerText;

                alert(`✅ ADDED TO CART:\n\nItem: ${title}\nPrice: ${price}\n\n(Check your cart to proceed to checkout)`);
                
                
                const originalText = button.innerText;
                button.innerText = "Added ✔";
                button.classList.add('btn-success'); 
                
                setTimeout(() => {
                    button.innerText = originalText;
                    button.classList.remove('btn-success');
                }, 2000);
            });
        });
    }
    const contactForm = document.querySelector('.contact-form form');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;

            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;
            
            submitBtn.innerText = "Sending...";
            submitBtn.disabled = true;

            setTimeout(() => {
                alert(`Thank you, ${name}!\n\nWe have received your message from ${email}.\nOur team will contact you within 24 hours.`);
                
                contactForm.reset(); 
                submitBtn.innerText = "Message Sent!";
                submitBtn.classList.add('btn-success');
                
                
                setTimeout(() => {
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('btn-success');
                }, 3000);
            }, 1500);
        });
    }

});