function openTab(evt, TabName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tab-content");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("head2");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(TabName).style.display = "block";
    evt.currentTarget.className += " active";
    
}
  // Get the element with id="defaultOpen" and click on it
document.getElementById("OpenAuto").click();
  
function openInsideTab(evt, TabName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("InsideTabContent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("media-element");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(TabName).style.display = "grid";
  evt.currentTarget.className += " active";
}
document.getElementById("InsideOpenAuto").click();



document.addEventListener("DOMContentLoaded", function() {
  // Create new HTML elements based on the data
  const cardsContainer = document.getElementById('all');
  const xhr = new XMLHttpRequest();
  xhr.open('GET', '/clothes');
  xhr.onload = function() {
    if (xhr.status === 200) {
      const clothes = JSON.parse(xhr.responseText);
      clothes.forEach(clothingItem => {
        const card = document.createElement('div');
        card.classList.add('card');

        card.onclick = toggle;

        const img1 = document.createElement('img');
        img1.src = '/outfit_images/images/' + clothingItem.imageupload;  // fix images, needs to be in public or not??
        const details = document.createElement('div');
        details.classList.add('card-content');
        const category = document.createElement('h2');
        category.textContent = clothingItem.colorname+ " " + clothingItem.clothingtype;
        const size = document.createElement('p');
        size.textContent = clothingItem.clothessize;
        const occasion = document.createElement('p');
        occasion.textContent = clothingItem.occasionname;

        details.appendChild(category);
        details.appendChild(occasion);
        details.appendChild(size);
        card.appendChild(img1);
        card.appendChild(details);
        cardsContainer.appendChild(card);
      });
    } else {
      console.error('Request failed. Status:', xhr.status);
    }
  };
  xhr.send();
});


function toggle() {
  var blur = document.getElementById("blur");
  blur.classList.toggle("active2");
  var popup = document.getElementById("modal-wrapper");
  popup.classList.toggle("active2");
}
function toggle2() {
  var blur = document.getElementById("blur");
  blur.classList.toggle("active2");
  var popup = document.getElementById("add-clothes-modal");
  popup.classList.toggle("active2");
}

var imgBox = document.getElementById("imgBox");
        var uploadButton = document.getElementById("upload-button");
        var LoadFile = function (event) {
          imgBox.style.backgroundImage = "url(" + URL.createObjectURL(event.target.files[0]) + ")";
          imgBox.style.border = "1px solid";
          imgBox.style.backgroundPosition = "center";
          imgBox.style.objectFit = "contain";
          uploadButton.style.display = "none";
        };

        let slideIndex = [1, 1, 1, 1, 1, 1];
        let slideId = [
          "mySlides1",
          "mySlides2",
          "mySlides3",
          "mySlides4",
          "mySlides5",
          "mySlides6",
        ];
        showSlides(1, 0);
        showSlides(1, 1);
        showSlides(1, 2);
        showSlides(1, 3);
        showSlides(1, 4);
        showSlides(1, 5);
  
        function plusSlides(n, no) {
          showSlides((slideIndex[no] += n), no);
        }
  
        function showSlides(n, no) {
          let i;
          let x = document.getElementsByClassName(slideId[no]);
          if (n > x.length) {
            slideIndex[no] = 1;
          }
          if (n < 1) {
            slideIndex[no] = x.length;
          }
          for (i = 0; i < x.length; i++) {
            x[i].style.display = "none";
          }
          x[slideIndex[no] - 1].style.display = "block";
        }


        function outfitToggle() {
          var blur = document.getElementById("blur");
          blur.classList.toggle("active3");
          var popup = document.getElementById("outfitModalWrapper");
          popup.classList.toggle("active3");
        }
        function createOutfitToggle() {
          var blur = document.getElementById("blur");
          blur.classList.toggle("active3");
          var popup = document.getElementById("addOutfitModalWrapper");
          popup.classList.toggle("active3");
        }