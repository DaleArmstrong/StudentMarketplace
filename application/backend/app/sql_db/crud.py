import datetime

from typing import List

from sqlalchemy import desc, asc, or_
from sqlalchemy.orm import Session

from app.sql_db import models, schemas
from passlib.hash import bcrypt

"""
This file is used for the 4 big interactions with the database: create, read, update, & delete.

Author(s): This file contains logic for many routers, all team members contributed
"""


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user: schemas.UserCreate):
    hashed_pw = bcrypt.hash(user.password)
    db_user = models.User(email=user.email, password_hash=hashed_pw)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_listings_for_search(db: Session, searchQuery: str, category: str, sort: str):
    if len(searchQuery) == 0:
        if category == 'Any':
            retVal = db.query(models.Listing).filter(models.Listing.isApproved)
        else:
            # Note: use like() for case sensitivity, ilike() for case insensitivity
            retVal = db.query(models.Listing).join(models.Listing.category).filter(models.Category.category == category,
                                                                                   models.Listing.isApproved)
    else:
        if category == 'Any':
            retVal = db.query(models.Listing).filter(or_(models.Listing.name.ilike('%' + searchQuery + '%'),
                                                         models.Listing.description.ilike('%' + searchQuery + '%'),
                                                         models.Listing.course.ilike('%' + searchQuery + '%')),
                                                     models.Listing.isApproved)
        else:
            retVal = db.query(models.Listing).join(models.Listing.category).filter(
                models.Category.category == category,
                or_(models.Listing.name.ilike('%' + searchQuery + '%'),
                    models.Listing.description.ilike('%' + searchQuery + '%'),
                    models.Listing.course.ilike('%' + searchQuery + '%')),
                models.Listing.isApproved)

    if sort == 'priceAscending':
        retVal = retVal.order_by(asc(models.Listing.price))
    elif sort == 'priceDescending':
        retVal = retVal.order_by(desc(models.Listing.price))

    return retVal.all()


def get_listings_by_user(db: Session, user: schemas.User):
    return db.query(models.Listing).filter(models.Listing.seller_id == user.id).all()


def get_listing_by_id(db: Session, listingId: int):
    retVal = db.query(models.Listing).filter(models.Listing.id == listingId).first()

    return retVal


def get_item_list_by_ids(db: Session, itemList: List[int], maxReturn: int):
    numberFound = 0
    retVal = []

    for item in itemList:
        currentItem = db.query(models.Listing).filter(models.Listing.id == item, models.Listing.isApproved).first()
        # Check if item is active and approved
        # if currentItem.isActive and currentItem.isApproved
        if currentItem:
            retVal.append(currentItem)
            numberFound += 1
        if numberFound >= maxReturn:
            break

    return retVal


def get_newest_listings(db: Session, numItems: int):
    retVal = db.query(models.Listing).filter(models.Listing.isApproved).\
        order_by(desc(models.Listing.timestamp)).limit(numItems).all()

    return retVal


def create_listing(db: Session, listing: schemas.Listing, photoPaths, category_string):
    # Create listing object
    db_listing = models.Listing(**listing.dict())

    category = db.query(models.Category).filter(models.Category.category == category_string).first()
    db_listing.category = category
    db_listing.category_id = category.id

    # Create PhotoPath objects for each photo path and add to the listing object
    for path, thumbnailPath in photoPaths:
        pathObj = models.PhotoPath()
        pathObj.path = path
        pathObj.thumbnailPath = thumbnailPath
        pathObj.listing_id = db_listing.id
        db_listing.photoPaths.append(pathObj)

    db.add(db_listing)
    db.commit()
    db.refresh(db_listing)

    return db_listing


def get_all_categories(db: Session):
    return db.query(models.Category).all()


def create_message(db: Session, message: str, listing_id: int):
    listing = get_listing_by_id(db, listing_id)
    db_message = models.Message(seller_id=listing.seller_id, listing_id=listing_id, timestamp=datetime.datetime.now(),
                                message=message)
    db.add(db_message)
    db.commit()
    db.refresh(db_message)


def get_message_by_seller_id(db: Session, user: schemas.User):
    return db.query(models.Message).filter(models.Message.seller_id == user.id).all()
