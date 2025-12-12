// AJAX Handler for Numbers API - FIXED VERSION

$(document).ready(function() {
    
    // Function to fetch fun fact from Numbers API
    function fetchFunFact() {
        const funFactContainer = $('#funFact');
        
        // Show loading state
        funFactContainer.html(`
            <i class="fas fa-spinner fa-spin fa-3x text-primary"></i>
            <p class="mt-3">Loading interesting fact...</p>
        `);
        
        // Make AJAX call to Numbers API (using HTTPS)
        $.ajax({
            url: 'https://numbersapi.com/1/30/date?json',
            method: 'GET',
            dataType: 'json',
            timeout: 10000, // 10 second timeout
            success: function(response) {
                console.log('Numbers API Response:', response);
                
                // Display the fact with animation
                displayFunFact(response);
            },
            error: function(xhr, status, error) {
                console.error('AJAX Error:', status, error);
                
                // Try fallback to HTTP if HTTPS fails
                $.ajax({
                    url: 'http://numbersapi.com/1/30/date?json',
                    method: 'GET',
                    dataType: 'json',
                    timeout: 10000,
                    success: function(response) {
                        console.log('Numbers API Response (HTTP fallback):', response);
                        displayFunFact(response);
                    },
                    error: function() {
                        // Display error message
                        funFactContainer.html(`
                            <i class="fas fa-exclamation-circle fa-3x text-danger mb-3"></i>
                            <p class="text-danger">Oops! Unable to load fun fact at the moment.</p>
                            <p class="text-muted small">This may be due to CORS restrictions or network issues.</p>
                            <button class="btn btn-primary btn-sm mt-2" onclick="location.reload()">
                                <i class="fas fa-redo"></i> Try Again
                            </button>
                        `);
                    }
                });
            }
        });
    }
    
    // Function to display the fun fact with animation
    function displayFunFact(data) {
        const funFactContainer = $('#funFact');
        
        // Create formatted content
        const content = `
            <div class="fun-fact-content fade-in">
                <i class="fas fa-calendar-day fa-3x text-primary mb-3"></i>
                <h4 class="text-primary mb-3">Date Fact: ${data.date || 'January 30'}</h4>
                <p class="lead">${data.text || 'No fact available'}</p>
                <hr class="my-3">
                <small class="text-muted">
                    <i class="fas fa-info-circle"></i> 
                    Fact Type: ${data.type || 'date'} | 
                    Found: ${data.found ? 'Yes' : 'No'} | 
                    Year: ${data.year || 'N/A'}
                </small>
            </div>
        `;
        
        // Update container with fade effect
        funFactContainer.fadeOut(300, function() {
            $(this).html(content).fadeIn(600);
        });
        
        // Add zoom animation
        setTimeout(() => {
            funFactContainer.find('.fun-fact-content').addClass('zoom-in');
        }, 100);
    }
    
    // Alternative function to fetch random math fact
    function fetchRandomMathFact() {
        $.ajax({
            url: 'https://numbersapi.com/random/math?json',
            method: 'GET',
            dataType: 'json',
            success: function(response) {
                console.log('Random Math Fact:', response);
                displayAlternativeFact(response, 'Math Fact');
            },
            error: function(xhr, status, error) {
                console.error('Math Fact Error:', error);
            }
        });
    }
    
    // Alternative function to fetch trivia
    function fetchRandomTrivia() {
        $.ajax({
            url: 'https://numbersapi.com/random/trivia?json',
            method: 'GET',
            dataType: 'json',
            success: function(response) {
                console.log('Random Trivia:', response);
                displayAlternativeFact(response, 'Number Trivia');
            },
            error: function(xhr, status, error) {
                console.error('Trivia Error:', error);
            }
        });
    }
    
    // Display alternative facts
    function displayAlternativeFact(data, title) {
        const content = `
            <div class="fun-fact-content fade-in">
                <i class="fas fa-lightbulb fa-3x text-warning mb-3"></i>
                <h4 class="text-primary mb-3">${title}</h4>
                <p class="lead">${data.text || 'No fact available'}</p>
                <hr class="my-3">
                <small class="text-muted">
                    <i class="fas fa-info-circle"></i> 
                    Number: ${data.number || 'N/A'} | 
                    Type: ${data.type || 'unknown'}
                </small>
            </div>
        `;
        
        $('#funFact').fadeOut(300, function() {
            $(this).html(content).fadeIn(600);
        });
    }
    
    // Add refresh button functionality
    function addRefreshButton() {
        const refreshBtn = `
            <button class="btn btn-outline-primary btn-sm mt-3 refresh-fact-btn">
                <i class="fas fa-sync-alt"></i> Load New Fact
            </button>
        `;
        
        if ($('.refresh-fact-btn').length === 0) {
            $('#funFact').after(refreshBtn);
            
            // Handle refresh button click
            $('.refresh-fact-btn').on('click', function() {
                $(this).find('i').addClass('fa-spin');
                fetchFunFact();
                
                setTimeout(() => {
                    $(this).find('i').removeClass('fa-spin');
                }, 1000);
            });
        }
    }
    
    // Initialize on page load
    fetchFunFact();
    
    // Optional: Add refresh button after fact loads
    setTimeout(() => {
        addRefreshButton();
    }, 2000);
    
    // Log AJAX setup
    console.log('✓ AJAX Handler initialized - Numbers API ready!');
    
    // Global AJAX error handler
    $(document).ajaxError(function(event, jqxhr, settings, thrownError) {
        console.error('Global AJAX Error:', {
            url: settings.url,
            status: jqxhr.status,
            error: thrownError
        });
    });
    
    // Global AJAX success handler
    $(document).ajaxSuccess(function(event, xhr, settings) {
        console.log('✓ AJAX Success:', settings.url);
    });
});