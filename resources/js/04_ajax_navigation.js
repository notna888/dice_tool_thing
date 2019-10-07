function navigate(urlToGoTo){
  console.log(urlToGoTo)

  // do some history stuff

  //check that the url isn't leaving out site

  urlToVisitBody = "./content/" + urlToGoTo
  urlToVisitHead = "./content/head/" + urlToGoTo
  // console.log(urlToVisitBody)
  console.log(urlToVisitHead)



  $.ajax({
    url: urlToVisitHead,
    async : true,
    type : 'GET',
    timeout : 10000,
    success: function(result, status, request){
      // console.log('SUCCESS!')
      // console.log(request)
      // console.log(result)
      curr_head = $('head').html()
      new_head = curr_head.replace(/<!-- Start Additional Header Part -->(.*\s*)*/, '<!-- Start Additional Header Part -->' + result);
      // console.log(new_head)
      $('head').html(new_head)
    },
    error : function(request, status, err){
      console.log(request)
      // window.location.href = urlToGoTo
    },
  });

  $.ajax({
    url: urlToVisitBody,
    async : true,
    type : 'GET',
    timeout : 10000,
    success: function(result, status, request){
      // console.log('SUCCESS!')
      // console.log(request)
      $('#main-section').html(result)
    },
    error : function(request, status, err){
      console.log(request)
      // window.location.href = urlToGoTo
    },
  });
  removeHrefAddOnclick()
}

function removeHrefAddOnclick(){
  $('a').each(function(){
    link = this
    // console.log(link)
    linkText = link.getAttribute("href")
    if(linkText.indexOf('#') != -1){
      // If the link is like an internal one of like used for the bootstrap navbar
      return true
    }
    if(linkText == '/' || linkText == ''){
      linkText = 'index.html'
    }
    // link.removeAttribute("href")
    link.setAttribute("onclick", "navigate('" + linkText + "')")
  })
}

function preventLinkAction(){
  $('a').click(function(e) {
    e.preventDefault();
    urlToLoad = e.target.href
    urlEnding = new URL(urlToLoad).pathname

    var stateObj = { id: urlEnding };
    // history.pushState(stateObj, "Website Name", urlEnding);
  });
}

$( document ).ready( function(){
  preventLinkAction()
  removeHrefAddOnclick()
})
