
        // Sample data for demonstration
        const sampleImages = [
            {
                id: 1,
                imageUrl: 'https://source.unsplash.com/random/300x200?fish',
                username: 'crypto_fisher',
                avatar: 'https://source.unsplash.com/random/40x40?portrait',
                likes: 120,
                comments: 14
            },
            {
                id: 2,
                imageUrl: 'https://source.unsplash.com/random/300x200?ocean',
                username: 'blockchain_diver',
                avatar: 'https://source.unsplash.com/random/40x40?face',
                likes: 89,
                comments: 7
            },
            {
                id: 3,
                imageUrl: 'https://source.unsplash.com/random/300x200?aquarium',
                username: 'ipfs_lover',
                avatar: 'https://source.unsplash.com/random/40x40?woman',
                likes: 210,
                comments: 23
            },
            {
                id: 4,
                imageUrl: 'https://source.unsplash.com/random/300x200?water',
                username: 'eth_goldfish',
                avatar: 'https://source.unsplash.com/random/40x40?man',
                likes: 67,
                comments: 5
            },
            {
                id: 5,
                imageUrl: 'https://source.unsplash.com/random/300x200?coral',
                username: 'web3_swimmer',
                avatar: 'https://source.unsplash.com/random/40x40?profile',
                likes: 154,
                comments: 19
            },
            {
                id: 6,
                imageUrl: 'https://source.unsplash.com/random/300x200?sea',
                username: 'token_collector',
                avatar: 'https://source.unsplash.com/random/40x40?girl',
                likes: 93,
                comments: 11
            }
        ];

        // DOM Elements
        const imageGrid = document.getElementById('image-grid');
        const connectMetamaskBtn = document.getElementById('connect-metamask');
        const connectGoogleBtn = document.getElementById('connect-google');
        const walletSection = document.getElementById('wallet-section');
        const uploadSection = document.getElementById('upload-section');
        const welcomeBanner = document.getElementById('welcome-banner');
        const walletAddressEl = document.getElementById('wallet-address');
        const fishBalanceEl = document.getElementById('fish-balance');
        const uploadDropzone = document.getElementById('upload-dropzone');
        const fileInput = document.getElementById('file-input');

        // Contract ABI and Address (simplified for demo)
        const contractABI = [
            "function balanceOf(address owner) view returns (uint256)",
            "function registerUser(address referrer) external",
            "function uploadImage(bytes32 imageHash, string calldata ipfsHash) external",
            "function likeImage(bytes32 imageHash) external",
            "function commentOnImage(bytes32 imageHash, string calldata comment) external"
        ];
        const contractAddress = "0x1234567890123456789012345678901234567890"; // Replace with actual contract address

        // Global variables
        let provider;
        let signer;
        let contract;
        let userWalletAddress;
        let isConnected = false;

        // Initialize the app
        function init() {
            // Display sample images
            renderImages();

            // Set up event listeners
            connectMetamaskBtn.addEventListener('click', connectMetamask);
            connectGoogleBtn.addEventListener('click', connectWithGoogle);
            uploadDropzone.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', handleFileUpload);
        }

        // Render images to the grid
        function renderImages() {
            imageGrid.innerHTML = '';
            
            sampleImages.forEach(img => {
                const card = document.createElement('div');
                card.className = 'image-card';
                card.innerHTML = `
                    <img src="${img.imageUrl}" alt="User image" class="card-image">
                    <div class="card-content">
                        <div class="user-info">
                            <img src="${img.avatar}" alt="${img.username}" class="user-avatar">
                            <span class="username">@${img.username}</span>
                        </div>
                        <div class="interaction-bar">
                            <span class="interaction-item like-btn" data-id="${img.id}">
                                <i class="far fa-heart"></i>
                                <span>${img.likes}</span>
                            </span>
                            <span class="interaction-item comment-btn" data-id="${img.id}">
                                <i class="far fa-comment"></i>
                                <span>${img.comments}</span>
                            </span>
                            <span class="interaction-item">
                                <i class="fas fa-fish"></i>
                                <span>+5 FISH</span>
                            </span>
                        </div>
                    </div>
                `;
                imageGrid.appendChild(card);
            });

            // Add event listeners to like and comment buttons
            document.querySelectorAll('.like-btn').forEach(btn => {
                btn.addEventListener('click', handleLike);
            });

            document.querySelectorAll('.comment-btn').forEach(btn => {
                btn.addEventListener('click', handleComment);
            });
        }

        // Connect to MetaMask
        async function connectMetamask() {
            if (window.ethereum) {
                try {
                    // Request account access
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    userWalletAddress = accounts[0];
                    
                    provider = new ethers.providers.Web3Provider(window.ethereum);
                    signer = provider.getSigner();
                    contract = new ethers.Contract(contractAddress, contractABI, signer);
                    
                    // Update UI
                    walletAddressEl.textContent = `Wallet: ${shortenAddress(userWalletAddress)}`;
                    await updateFishBalance();
                    
                    showLoggedInUI();
                    
                    // Check if user is registered, if not register them
                    checkAndRegisterUser();
                    
                } catch (error) {
                    console.error("User denied account access", error);
                    alert("Please connect your MetaMask wallet to use Goldfish Network.");
                }
            } else {
                alert("Please install MetaMask to use Goldfish Network with Ethereum.");
            }
        }

        // Connect with Google (simulated)
        function connectWithGoogle() {
            // In a real app, this would use Firebase Auth or similar
            alert("Google authentication would be implemented here. You would then link your wallet address.");
            
            // For demo purposes, simulate a successful login
            const mockWalletAddress = "0x" + Math.random().toString(16).substr(2, 40);
            userWalletAddress = mockWalletAddress;
            
            // Update UI
            walletAddressEl.textContent = `Wallet: ${shortenAddress(userWalletAddress)}`;
            fishBalanceEl.textContent = "500"; // Starting amount
            
            showLoggedInUI();
        }

        // Show logged in UI elements
        function showLoggedInUI() {
            isConnected = true;
            walletSection.style.display = 'block';
            uploadSection.style.display = 'block';
            welcomeBanner.style.display = 'none';
            
            // Change auth buttons to user profile
            const authSection = document.getElementById('auth-section');
            authSection.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="https://source.unsplash.com/random/40x40?profile" class="user-avatar">
                    <span>My Profile</span>
                </div>
            `;
        }

        // Update FISH token balance
        async function updateFishBalance() {
            try {
                const balance = await contract.balanceOf(userWalletAddress);
                const formattedBalance = ethers.utils.formatUnits(balance, 18);
                fishBalanceEl.textContent = parseFloat(formattedBalance).toFixed(2);
            } catch (error) {
                console.error("Error fetching balance:", error);
                fishBalanceEl.textContent = "Error";
            }
        }

        // Handle file upload
        async function handleFileUpload(event) {
            if (!isConnected) {
                alert("Please connect your wallet first");
                return;
            }
            
            const file = event.target.files[0];
            if (!file) return;
            
            try {
                // In a real app, you would:
                // 1. Upload to IPFS
                // 2. Get IPFS hash
                // 3. Call smart contract

                // Simulate IPFS upload
                alert("Uploading to IPFS... (simulation)");
                
                // Generate a mock IPFS hash
                const mockIpfsHash = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                
                // Calculate image hash (for blockchain)
                const imageHash = ethers.utils.id(file.name + Date.now());
                
                try {
                    // Call smart contract (would happen in production)
                    // await contract.uploadImage(imageHash, mockIpfsHash);
                    
                    // Simulate success
                    alert(`Image uploaded successfully!\nIPFS: ${mockIpfsHash}\nReward: 100 FISH tokens`);
                    
                    // Update balance display (subtract 100 FISH)
                    const currentBalance = parseFloat(fishBalanceEl.textContent);
                    fishBalanceEl.textContent = (currentBalance + 100).toFixed(2);
                    
                    // Add the new image to the grid (at the top)
                    const newImage = {
                        id: sampleImages.length + 1,
                        imageUrl: URL.createObjectURL(file),
                        username: "you",
                        avatar: "https://source.unsplash.com/random/40x40?profile",
                        likes: 0,
                        comments: 0
                    };
                    
                    sampleImages.unshift(newImage);
                    renderImages();
                    
                } catch (error) {
                    console.error("Error uploading image:", error);
                    alert("Error uploading image. Make sure you have enough FISH tokens.");
                }
            } catch (error) {
                console.error("Error processing file:", error);
                alert("Error processing file. Please try again.");
            }
        }

        // Check if user is registered, if not register them
        async function checkAndRegisterUser() {
            // In a real implementation, you would check if the user is registered
            // For demo purposes, we'll simulate a registration bonus
            
            try {
                // Simulate contract call
                // await contract.registerUser(ethers.constants.AddressZero); // No referrer
                
                // Update balance with registration bonus
                fishBalanceEl.textContent = "500.00";
                
                alert("Welcome to Goldfish Network! You've received 500 FISH tokens as a registration bonus.");
                
            } catch (error) {
                console.error("Error registering user:", error);
            }
        }

        // Handle like button click
        async function handleLike(event) {
            if (!isConnected) {
                alert("Please connect your wallet first");
                return;
            }
            
            const imageId = event.currentTarget.getAttribute('data-id');
            const likeCountEl = event.currentTarget.querySelector('span');
            const heartIcon = event.currentTarget.querySelector('i');
            
            try {
                // In a production app, call smart contract
                // await contract.likeImage(ethers.utils.id(imageId));
                
                // Update UI
                likeCountEl.textContent = parseInt(likeCountEl.textContent) + 1;
                heartIcon.className = 'fas fa-heart'; // Solid heart icon
                
                // Update balance
                const currentBalance = parseFloat(fishBalanceEl.textContent);
                fishBalanceEl.textContent = (currentBalance + 5).toFixed(2);
                
                // Disable further clicks
                event.currentTarget.style.color = "var(--primary-color)";
                event.currentTarget.style.pointerEvents = "none";
                
                alert("You earned 5 FISH tokens for liking this image!");
                
            } catch (error) {
                console.error("Error liking image:", error);
                alert("Error liking image. Please try again.");
            }
        }

        // Handle comment button click
        async function handleComment(event) {
            if (!isConnected) {
                alert("Please connect your wallet first");
                return;
            }
            
            const imageId = event.currentTarget.getAttribute('data-id');
            const commentCountEl = event.currentTarget.querySelector('span');
            
            // Prompt for comment
            const comment = prompt("Enter your comment:");
            if (!comment) return; // User cancelled
            
            try {
                // In a production app, call smart contract
                // await contract.commentOnImage(ethers.utils.id(imageId), comment);
                
                // Update UI
                commentCountEl.textContent = parseInt(commentCountEl.textContent) + 1;
                
                // Update balance
                const currentBalance = parseFloat(fishBalanceEl.textContent);
                fishBalanceEl.textContent = (currentBalance + 30).toFixed(2);
                
                alert("You earned 30 FISH tokens for commenting on this image!");
                
            } catch (error) {
                console.error("Error commenting on image:", error);
                alert("Error posting comment. Please try again.");
            }
        }

        // Generate referral link
        function generateReferralLink() {
            if (!userWalletAddress) return null;
            
            const baseUrl = window.location.origin + window.location.pathname;
            return `${baseUrl}?ref=${userWalletAddress}`;
        }

        // Helper function to shorten address
        function shortenAddress(address) {
            return address.substring(0, 6) + '...' + address.substring(address.length - 4);
        }

        // Initialize the app on load
        window.addEventListener('DOMContentLoaded', init);

        // Check for referral in URL
        window.addEventListener('load', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const refAddress = urlParams.get('ref');
            
            if (refAddress) {
                // Store the referral address for later use during registration
                localStorage.setItem('referrer', refAddress);
                alert(`You were referred by ${shortenAddress(refAddress)}. Connect your wallet to claim your 200 FISH bonus!`);
            }
        });
  
