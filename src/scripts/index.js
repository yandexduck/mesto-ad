/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import { createCardElement, deleteCard, updateCardLikes } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import {
  addCard,
  changeLikeCardStatus,
  getCardList,
  getUserInfo,
  removeCard,
  setUserAvatar,
  setUserInfo,
} from "./components/api.js";

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");
const profileSubmitButton = profileForm.querySelector(".popup__button");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");
const cardSubmitButton = cardForm.querySelector(".popup__button");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const cardInfoModalWindow = document.querySelector(".popup_type_info");
const cardInfoList = cardInfoModalWindow.querySelector(".popup__info");
const cardInfoLikesTitle = cardInfoModalWindow.querySelector(".popup__text");
const cardInfoUsersList = cardInfoModalWindow.querySelector(".popup__list");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");
const avatarSubmitButton = avatarForm.querySelector(".popup__button");

let currentUserId = "";

const renderLoading = (buttonElement, isLoading, loadingText) => {
  buttonElement.textContent = isLoading ? loadingText : buttonElement.dataset.defaultText;
};

const saveDefaultButtonText = (buttonElement) => {
  buttonElement.dataset.defaultText = buttonElement.textContent;
};

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const setProfileData = ({ name, about, avatar, _id }) => {
  profileTitle.textContent = name;
  profileDescription.textContent = about;
  profileAvatar.style.backgroundImage = `url(${avatar})`;
  currentUserId = _id;
};

const createInfoString = (term, description) => {
  const infoElement = document
    .getElementById("popup-info-definition-template")
    .content.querySelector(".popup__info-item")
    .cloneNode(true);

  infoElement.querySelector(".popup__info-term").textContent = term;
  infoElement.querySelector(".popup__info-description").textContent = description;

  return infoElement;
};

const createLikedUserPreview = (name) => {
  const userPreviewElement = document
    .getElementById("popup-info-user-preview-template")
    .content.querySelector(".popup__list-item")
    .cloneNode(true);

  userPreviewElement.textContent = name;

  return userPreviewElement;
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleDeleteCard = (cardId, cardElement) => {
  removeCard(cardId)
    .then(() => {
      deleteCard(cardElement);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleLikeCard = (cardData, likeButton, likeCountElement) => {
  const isLiked = cardData.likes.some((user) => user._id === currentUserId);

  changeLikeCardStatus(cardData._id, isLiked)
    .then((updatedCardData) => {
      cardData.likes = updatedCardData.likes;
      updateCardLikes(likeButton, likeCountElement, cardData.likes, currentUserId);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleInfoClick = (cardId) => {
  getCardList()
    .then((cards) => {
      const cardData = cards.find((card) => card._id === cardId);

      cardInfoList.textContent = "";
      cardInfoUsersList.textContent = "";
      cardInfoLikesTitle.textContent = "Лайкнули:";

      cardInfoList.append(
        createInfoString("Описание:", cardData.name),
        createInfoString("Дата создания:", formatDate(new Date(cardData.createdAt))),
        createInfoString("Владелец:", cardData.owner.name),
        createInfoString("Количество лайков:", cardData.likes.length)
      );

      cardData.likes.forEach((user) => {
        cardInfoUsersList.append(createLikedUserPreview(user.name));
      });

      openModalWindow(cardInfoModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

const createCard = (data) => {
  return createCardElement(data, currentUserId, {
    onPreviewPicture: handlePreviewPicture,
    onLikeIcon: handleLikeCard,
    onDeleteCard: handleDeleteCard,
    onInfoClick: handleInfoClick,
  });
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(profileSubmitButton, true, "Сохранение...");

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      setProfileData(userData);
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(profileSubmitButton, false);
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(avatarSubmitButton, true, "Сохранение...");

  setUserAvatar(avatarInput.value)
    .then((userData) => {
      setProfileData(userData);
      avatarForm.reset();
      clearValidation(avatarForm, validationSettings);
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(avatarSubmitButton, false);
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(cardSubmitButton, true, "Создание...");

  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      placesWrap.prepend(createCard(cardData));
      cardForm.reset();
      clearValidation(cardForm, validationSettings);
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(cardSubmitButton, false);
    });
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

[profileSubmitButton, cardSubmitButton, avatarSubmitButton].forEach(saveDefaultButtonText);

enableValidation(validationSettings);

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    setProfileData(userData);

    cards.forEach((data) => {
      placesWrap.append(createCard(data));
    });
  })
  .catch((err) => {
    console.log(err);
  });
