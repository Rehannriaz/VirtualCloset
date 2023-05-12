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
  if (TabName == "looks") {
    displayOutfitCards();
  }
}
// Get the element with id="defaultOpen" and click on it
document.getElementById("OpenAuto").click();

function displayOutfitCards() {
  const cardsContainer = document.getElementById("InsideTab");

  // InsideTabContent.classList.add("InsideTabContent-2");
  // InsideTabContent.className="InsideTabContent-2";
  cardsContainer.innerHTML =
    '<div class="card" onclick="createOutfitToggle()"><img src="images/plus-60.png" alt="" /><div class="card-content"><h2>Add new outfit</h2></div></div>';
  // cardsContainer.append(InsideTabContent);
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "/outfitCards");
  xhr.onload = function displayOutfitCards() {

    if (xhr.status === 200) {
      const outfits = JSON.parse(xhr.responseText);
      outfits.forEach((outfit) => {
        const card = document.createElement("div");
        card.className = "card";
        card.onclick = function displayOutfitCards() {
          outfitToggleModal(outfit);
        };
        const img1 = document.createElement("img");
        img1.src = "images/pexels-tembela-bohle-1884584.jpg";
        card.append(img1);
        const cardcontent = document.createElement("div");
        cardcontent.className = "card-content";
        const parag = document.createElement("p");
        parag.textContent = outfit.overalltype;
        const h2txt = document.createElement("h2");
        h2txt.textContent = outfit.outfitname;
        cardcontent.append(h2txt);
        cardcontent.append(parag);
        card.append(cardcontent);
        cardsContainer.append(card);
      });
    }
  };
  xhr.send();
}

function openInsideTab(evt, TabName) {
  // Check if the tab is already active
  if (evt.currentTarget.classList.contains("active")) {
    return;
  }

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
  // clothesAdd=document.querySelector(".InsideTabContent #add-clothes");
  evt.currentTarget.className += " active";
  for (i = 0; i < tabcontent.length; i++) {
    if (tabcontent[i].className != "active") tabcontent[i].innerHTML = "";
  }

  displayCards(TabName);
}
document.getElementById("InsideOpenAuto").click();

function displayCards(TabName) {
  // Create new HTML elements based on the data
  const cardsContainer = document.getElementById(TabName);
  if (TabName == "all") {
    console.log("TAB NAME : " + TabName);
    cardsContainer.innerHTML =
      '<div class="card" onclick="toggle2()" id="add-clothes"><img src="images/plus-60.png" alt="" /></div>';
  }
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "/clothes?clothingtype=" + TabName);
  xhr.onload = function displayCards(TabName) {
    if (xhr.status === 200) {
      const clothes = JSON.parse(xhr.responseText);
      clothes.forEach((clothingItem) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.onclick = function displayCards(TabName) {
          toggle(clothingItem);
        };

        const img1 = document.createElement("img");
        img1.src = "/outfit_images/images/" + clothingItem.imageupload; // fix images, needs to be in public or not??

        const details = document.createElement("div");
        details.classList.add("card-content");
        const category = document.createElement("h2");
        category.textContent =
          clothingItem.colorname + " " + clothingItem.categoryname;
        const size = document.createElement("p");
        size.textContent = clothingItem.clothessize;
        const occasion = document.createElement("p");
        occasion.textContent = clothingItem.occasionname;
        const heartContainer = document.createElement("div");
        heartContainer.className = "heart-container";
        if(clothingItem.favourites)
        {
          const heart=document.createElement('i');
          heart.className="fa-heart fa-3xl heart fa-solid selected2";
          heart.onclick=function displayCards(TabName){
            changeFillColor(event,clothingItem.item_id);
          }
          heartContainer.appendChild(heart);
        }
        else{
          const heart=document.createElement('i');
          heart.className="fa-regular fa-heart fa-3xl heart";
          heart.onclick=function displayCards(TabName){
            changeFillColor(event,clothingItem.item_id);
          }
          heartContainer.appendChild(heart);
        }
        details.appendChild(category);
        details.appendChild(occasion);
        details.appendChild(size);
        card.appendChild(img1);
        card.appendChild(details);
        card.appendChild(heartContainer);

        cardsContainer.appendChild(card);
      });
    } else {
      console.error("Request failed. 321Status:", xhr.status);
    }
  };
  xhr.send();
}

function changeFillColor(event,item_id) {
  event.stopPropagation();
  var icon = event.target;
  icon.classList.toggle("fa-regular");
  icon.classList.toggle("fa-solid");
  icon.classList.toggle("selected2");
  // console.log("ITEM ID "+ item_id);
  const isSelected = icon.classList.contains("selected2");
    const requestData = {
    cardId: item_id,
    isSelected: isSelected,
  };
  console.log("IS SELECTED"+isSelected);
   const xhr = new XMLHttpRequest();
  xhr.open("POST", "/cardFav");
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send(JSON.stringify(requestData));
}




function toggleModal() {
  var blur = document.getElementById("blur");
  blur.classList.toggle("active2");
  var popup = document.getElementById("modal-wrapper");
  popup.classList.toggle("active2");
  popup.innerHTML = "";
}

function toggle(clothingItem) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "/clothdetail?item_id=" + clothingItem.item_id);

  xhr.onload = function () {
    if (xhr.status === 200) {
      const clothingItemDetails = JSON.parse(xhr.responseText)[0];

      console.log(clothingItem.item_id);
      const modalWrapper = document.getElementById("modal-wrapper");
      modalWrapper.id = "modal-wrapper";

      // Create modal image element
      const modalImg = document.createElement("div");
      modalImg.id = "modal-img";

      const img = document.createElement("img");
      img.src = "/outfit_images/images/" + clothingItem.imageupload;

      const imgCaption = document.createElement("h2");
      imgCaption.textContent = "Cloth Details";

      modalImg.appendChild(imgCaption);
      modalImg.appendChild(img);

      // Create modal content element
      const modalContent = document.createElement("div");
      modalContent.id = "modal-content";

      const category1 = document.createElement("p");
      category1.innerHTML = `category: <span class="cloth-desc">${clothingItem.categoryname}</span>`;

      const type = document.createElement("p");
      type.innerHTML = `type: <span class="cloth-desc">${clothingItem.clothingtype}</span>`;

      const color = document.createElement("p");
      color.innerHTML = `color: <span class="cloth-desc">${clothingItem.colorname}</span>`;

      const colorCode = document.createElement("p");
      colorCode.innerHTML = `color code: <span class="cloth-desc">${clothingItem.colorcode}</span>`;

      const size1 = document.createElement("p");
      size1.innerHTML = `Size: <span class="cloth-desc">${clothingItem.clothessize}</span>`;

      const season = document.createElement("p");
      season.innerHTML = `Season: <span class="cloth-desc">${clothingItem.clothingseason}</span>`;

      const fabric = document.createElement("p");
      fabric.innerHTML = `Fabric: <span class="cloth-desc">${clothingItem.fabrictype}</span>`;

      const occasion1 = document.createElement("p");
      occasion1.innerHTML = `Occasion: <span class="cloth-desc">${clothingItem.occasionname}</span>`;

      modalContent.appendChild(category1);
      modalContent.appendChild(type);
      modalContent.appendChild(color);
      modalContent.appendChild(colorCode);
      modalContent.appendChild(size1);
      modalContent.appendChild(season);
      modalContent.appendChild(fabric);
      modalContent.appendChild(occasion1);

      // Create close button element
      const closeButton = document.createElement("button");
      closeButton.className = "close";
      closeButton.id = "close2";
      closeButton.onclick = toggleModal;

      const closeImg = document.createElement("img");
      closeImg.src = "images/close-button.png";
      closeImg.alt = "";

      closeButton.appendChild(closeImg);

      // Add elements to modal wrapper
      modalWrapper.appendChild(modalImg);
      modalWrapper.appendChild(modalContent);
      modalWrapper.appendChild(closeButton);

      // modalContainer.appendChild(modalWrapper);
    } else {
      console.error("Request failed. 123Status:", xhr.status);
    }
  };
  xhr.send();

  var blur = document.getElementById("blur");
  blur.classList.toggle("active2");
  var popup = document.getElementById("modal-wrapper");
  console.log(popup);
  popup.classList.toggle("active2");
}

function toggle2() {
  var blur = document.getElementById("blur");
  blur.classList.toggle("active2");
  var popup = document.getElementById("add-clothes-modal");
  popup.classList.toggle("active2");
  var imgBox = document.getElementById("imgBox");
  var uploadButton = document.getElementById("upload-button");

  imgBox.style.backgroundImage = "none";
  imgBox.style.border = "2px dashed rgb(95, 95, 95)";
  uploadButton.style.display = "";
}

var imgBox = document.getElementById("imgBox");
var uploadButton = document.getElementById("upload-button");
var LoadFile = function (event) {
  imgBox.style.backgroundImage =
    "url(" + URL.createObjectURL(event.target.files[0]) + ")";
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
    x[i].id = no + "NONEID" + i;
  }

  SID = x[slideIndex[no] - 1];
  SID.style.display = "block";
  SID.id = "hoverIMG" + no;
  const slide = document.getElementById("hoverIMG" + no);
  const parag = document.createElement("input");
  parag.style.display = "none";
  parag.type = "hidden";
  parag.name = "hoverIMG" + no;
  imgSrc = getImage(no);
  parag.value = imgSrc;
  slide.appendChild(parag);

  for (i = 0; i < x.length; i++) {
    if (x[i].id == no + "NONEID" + i) {
      const temp = document.getElementById(no + "NONEID" + i);
      const input = temp.querySelector("input");
      if (input) input.remove();
    }
  }
}


function outfitToggleModal(outfit) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "outfitdetail?outfitid=" + outfit.outfit_id);
  xhr.onload = function () {
    if (xhr.status === 200) {
      const clothingItemDetails = JSON.parse(xhr.responseText);
      const outfitWrap= document.getElementById("outfitModalWrapper");
      outfitWrap.innerHTML='<button class="cross-btn" onclick="outfitToggle()"><img src="images/xmark-solid.svg" alt="" /></button> <h2 id="outfitDetails">Outfit Details</h2><hr /><div class="outfitsGrid" id="OUTFITGRIDID"></div> <div class="edit-btn"><button>Edit Outfit</button></div>'
      const outfitGRID= document.getElementById("OUTFITGRIDID");
      var i=0;
      clothingItemDetails.forEach((outfitTYPE) => {
          const gridCard=document.createElement("div");
          gridCard.className="grid-card";
          const buttonTog=document.createElement("button");
          buttonTog.onclick=function outfitToggleModal(outfit){
            toggle(outfitTYPE);
          }
          const img1=document.createElement("img");
          img1.src="/outfit_images/images/"+outfitTYPE.imageupload;
          buttonTog.append(img1);looks

      });


    } else {
      console.error("Request failed. outfittoggle fail:", xhr.status);
    }
  };

  xhr.send();
  outfitToggle();
}
function outfitToggle()

{
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
  // document.getElementById('looks').click();
}

function getImage(no) {
  {
    let imgname = document.getElementById("hoverIMG" + no);
    let imgElement = imgname.querySelector("img");
    // imgElement.name=
    // imgElement.setAttribute("name","hoverIMG"+no);
    let imgSrc = imgElement.getAttribute("src");
    imgSrc = imgSrc.substring(imgSrc.lastIndexOf("/") + 1);
    return imgSrc;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const clothingTypeToClass = {
    Tops: "top",
    Bottoms: "bottom",
    "Suits/Dresses": "dress",
    "Foot wear": "shoes",
    Bags: "bag",
    "Caps/Hats": "cap",
  };

  const slideContainers = [
    {
      slideContainer: document.getElementById("slideshow-1"),
      className: "mySlides1",
    },
    {
      slideContainer: document.getElementById("slideshow-2"),
      className: "mySlides2",
    },
    {
      slideContainer: document.getElementById("slideshow-3"),
      className: "mySlides3",
    },
    {
      slideContainer: document.getElementById("slideshow-4"),
      className: "mySlides4",
    },
    {
      slideContainer: document.getElementById("slideshow-5"),
      className: "mySlides5",
    },
    {
      slideContainer: document.getElementById("slideshow-6"),
      className: "mySlides6",
    },
  ];

  slideContainers.forEach(function (slideObj) {
    const slideContainer = slideObj.slideContainer;
    const className = slideObj.className;

    const clothingType = document.querySelector(
      `#${slideContainer.id} p`
    ).textContent;
    const clothingClass = clothingTypeToClass[clothingType];
    // console.log("clothing type ::: " + clothingClass);

    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/outfitSlides?clothingtype=" + clothingClass);
    xhr.onload = function () {
      if (xhr.status === 200) {
        const clothes = JSON.parse(xhr.responseText);
        clothes.forEach(function (clothingItem) {
          const slide = document.createElement("div");
          slide.className = className;
          const img = document.createElement("img");
          img.src = "/outfit_images/images/" + clothingItem.imageupload;
          slide.appendChild(img);

          console.log("clothing type ::: " + clothingClass);
          slideContainer.append(slide);
        });
      } else {
        // console.error(`Request failed outfitslides for ${clothingClass}. Status: ${xhr.status}`);
      }
    };
    xhr.send();
  });
});
