export const deleteCard = (cardElement) => {
  cardElement.remove();
};

const isCardLiked = (likes, userId) => {
  return likes.some((user) => user._id === userId);
};

export const updateCardLikes = (likeButton, likeCountElement, likes, userId) => {
  likeCountElement.textContent = likes.length;
  likeButton.classList.toggle("card__like-button_is-active", isCardLiked(likes, userId));
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  userId,
  { onPreviewPicture, onLikeIcon, onDeleteCard, onInfoClick }
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCountElement = cardElement.querySelector(".card__like-count");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const infoButton = cardElement.querySelector(".card__control-button_type_info");
  const cardImage = cardElement.querySelector(".card__image");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;
  updateCardLikes(likeButton, likeCountElement, data.likes, userId);

  if (onLikeIcon) {
    likeButton.addEventListener("click", () => onLikeIcon(data, likeButton, likeCountElement));
  }

  if (data.owner._id === userId) {
    deleteButton.addEventListener("click", () => onDeleteCard(data._id, cardElement));
  } else {
    deleteButton.remove();
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => onPreviewPicture({name: data.name, link: data.link}));
  }

  if (onInfoClick) {
    infoButton.addEventListener("click", () => onInfoClick(data._id));
  }

  return cardElement;
};
