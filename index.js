'use strict'

//global consts/variables
const searchURL = "https://wger.de/api/v2/exercise/search/";
const apiKey = 'AIzaSyAmOsgJp0DLCE0Cw5yPIvtG4rTwSz1m2f0';
const searchYtURL = 'https://www.googleapis.com/youtube/v3/search';
let previousSearchResult;
let nextJson;
let searchTermYouTube;
let bodyArea;



function activateScroll(){
    $('html,header').animate({ scrollTop: $('.content').offset().top - 20});    
}




//format params
function formatQueryParams(params) {
    const queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

//display getTerm() to DOM
function displayResults(wgerJson) {

    console.log(wgerJson);
    $('#wger-results-user').empty();

    if (wgerJson.suggestions.length === 0) {
        $('#wger-results-user').append(
            `<li><h3>Sorry, Your search has no results. Try Again!</h3></li>`
        )
    } else {
        for (let i = 0; i < wgerJson.suggestions.length; i++) {

            $('#wger-results-user').append(
                `<li><h3>${wgerJson.suggestions[i].data.name}</h3>
        <p>${wgerJson.suggestions[i].data.category}</p>
        <button class="id-fetch" data-id="${wgerJson.suggestions[i].data.id}">Learn More</button>
        </li>`
            )
        };
    }
    
};



// display id from handleLearnMore() to DOM
function idResults(idJson) {

    
    searchTermYouTube = `${idJson.name}`;
    getYouTubeVideos(searchTermYouTube);
    
    $('.your-results-wger').hide();

    $('#wger-learnMore-user').append(
        `<li><h3>${idJson.name}</h3>
        <p>${idJson.description}</p>
        <button id="backBtn" onclick="goBack()"> Go Back</button>
        <button onclick="startOvr()" class="startOvr"><a href="#startOver">Search Again</a></button></li>
        `

    );


   
};

function goBack() {
    $('.your-results-wger').show();
    $('#wger-learnMore-user').empty();
    $('.results-youtube').empty();

}

function startOvr() {
    $('.your-results-wger').show();
    $('#wger-results-user').empty();
    $('#wger-learnMore-user').empty();
    $('.error-message').empty();
    $('.results-youtube').empty();
    $("#exercise-form").trigger('reset');
    $(".boxtitle-hidden").hide(); 
    $('#next-hidden').hide();
    $('#previous-hidden').hide();
    
    
}

// display results from search two to the DOM
function radioResults(radioJson, bodyArea) {

    

    previousSearchResult = radioJson.previous;
    nextJson = radioJson.next;
    bodyArea = $($(":radio[name=Body]:checked").prop("labels")).text();
    $('#wger-results-user').empty();
    
    if (radioJson.previous === null && radioJson.next === null) {
        $('#next-hidden').hide();
        $('#previous-hidden').hide();
      
    } else if (radioJson.previous === null) {
        $('#previous-hidden').hide();
        $('#next-hidden').show();
       
    } else if (radioJson.next === null){
        $('#previous-hidden').show();
        $('#next-hidden').hide();
        

    } else {
        $('#next-hidden').show();
        $('#previous-hidden').show();
        

       
    }
    for (let i = 0; i < radioJson.results.length; i++) {

        $('#wger-results-user').append(
            `<li><h3>${radioJson.results[i].name}</h3>
            <p>${bodyArea}</p>
            <button class="id-fetch" data-id="${radioJson.results[i].id}">Learn More</button>
            </li>`
        )
    };
};



// create a term fetch(search one) 
function getTerm(userTerm) {
    const params = {
        
        term: userTerm,
        
    };

    let queryString = formatQueryParams(params);
    const url = searchURL + '?' + queryString;

    startOvr();

    fetch(url)
        .then(wger => {
            if (wger.ok) {
                return wger.json();
            }
            throw new Error(wger.statusText);
        })
        .then(wgerJson => {

            displayResults(wgerJson)
            $(".boxtitle-hidden").show();  
            activateScroll();
        })
        .catch(err => {
            $('#js-er-message').text(`Sorry, something went wrong, check your internet connection or Try Again Later!: ${err.message}`);
        });
}


// listener for the submit button(search one) to display the results
function handleSubmit() {
    $('#exercise-form').submit( event => {
        event.preventDefault();
        const userTerm = $('#search-field').val();
        getTerm(userTerm);
        
    });
}
// id fetch display description and name
function handleLearnMore() {
    
    $('#wger-results-user').on('click', '.id-fetch', event => {
        const idName = $(event.target).attr('data-id')
       
        fetchExInfo(idName);

    });

}

// get Youtube Videos with learn more function
function getYouTubeVideos(searchTermYouTube) {

    const tubeParams = {
        q: searchTermYouTube,
        part: 'snippet',
        maxResults: 3,
        key: apiKey
    };

    let queryString = formatQueryParams(tubeParams)
    const youTubeURL = searchYtURL + '?' + queryString;
    

    fetch(youTubeURL)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => videoResults(responseJson))
        .catch(err => {
            $('#js-err-message').text(`Sorry, something went wrong, check your internet connection or Try Again Later!: ${err.data}`);
        });
}

function videoResults(responseJson) {

    
    $('.results-youtube').empty();

    for (let i = 0; i < responseJson.items.length; i++) {

        $('.results-youtube').append(
            `<li>
            <div class="videoWrapper"><iframe src="https://www.youtube.com/embed/${responseJson.items[i].id.videoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>
            <h4>${responseJson.items[i].snippet.title}</h4>
            <p>${responseJson.items[i].snippet.description}</p>
            </li>`
        )
        
    };
    
}



//handle when someone sellects the Next button
function handleNextButton() {
    
    $('#next-hidden').on('click', function () {
        fetch(nextJson)
            .then(nextPage => {
                if (nextPage.ok) {
                    return nextPage.json();
                }
                throw new Error(nextPage.statusText);
            })
            .then(nextPageJson => radioResults(nextPageJson))
            .catch(err => {
                $('#js-error-message').text(`Sorry, something went wrong, check your internet connection or Try Again Later!: ${err.message}`);
            });
    });
}

//handle when someone selects previous button
function handlePreviousButton() {
    $('#previous-hidden').on('click', function () {
        fetch(previousSearchResult)
            .then(previousSearchResult => {
                if (previousSearchResult.ok) {
                    return previousSearchResult.json();
                }
                throw new Error(previousSearchResult.statusText);
            })
            .then(previousSearchResultJson => radioResults(previousSearchResultJson))
            .catch(err => {
                $('#js-error-message').text(`Sorry, something went wrong, check your internet connection or Try Again Later!: ${err.message}`);
            });
    });
}


//Search wger by Id name in first fetch
function fetchExInfo(idName) {
    const exURL = "https://wger.de/api/v2/exercise/" + idName;

    

    fetch(exURL)
        .then(id => {
            if (id.ok) {
                return id.json();
            }
            throw new Error(id.statusText);
        })
        .then(idJson => idResults(idJson))
        .catch(err => {
            $('#js-err-message').text(`Sorry, something went wrong, check your internet connection or Try Again Later!: ${err.message}`);
        });
}

//listener for search two
function radioButtonSearch() {
    $('#body-form').submit( event => {
        event.preventDefault();
        let radioValue = $("input[name='Body']:checked").val();
        const radioURL = "https://wger.de/api/v2/exercise/?limit=5&category=" + radioValue + "&language=2&status=2";
        
        startOvr();
        
        fetch(radioURL)
            .then(radio => {
                if (radio.ok) {
                    return radio.json();
                }
                throw new Error(radio.statusText);
            })
            .then(radioJson => {radioResults(radioJson, bodyArea)
            $(".boxtitle-hidden").show();    
            activateScroll();
            })
            .catch(err => {
                $('#js-error-message').text(`Sorry, something went wrong, check your internet connection or Try Again Later!: ${err.message}`);
            });
    });
    }



$(function () {
    handleSubmit();
    handleLearnMore();
    radioButtonSearch();
    handleNextButton();
    handlePreviousButton();
    
});


