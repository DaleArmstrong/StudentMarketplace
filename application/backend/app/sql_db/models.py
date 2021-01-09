from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Numeric, ARRAY
from sqlalchemy.orm import relationship

from app.sql_db.database import Base


"""
This file has the SQLAlchemy database models that are used to generate the database tables.
It will have much more in the future as we add users, etc.

Authors: Lukas Pettersson, Joseph Babel, Niall Healy
"""


# =====Main Tables=====

class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(320), unique=True, index=True)
    password_hash = Column(String(100))
    timestamp = Column(DateTime)

    listings = relationship("Listing", back_populates="seller", cascade="all, delete-orphan", passive_deletes=True)
    messages = relationship("Message", back_populates="seller", cascade="all, delete-orphan", passive_deletes=True)

    def __repr__(self):
        return "%s(%r)" % (self.__class__, self.__dict__)


class Listing(Base):
    __tablename__ = 'listing'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(32), index=True)
    timestamp = Column(DateTime)
    description = Column(String(144), index=True)
    price = Column(Numeric)  # Fixed precision number for price
    course = Column(String(32))
    isApproved = Column(Boolean, default=False)
    isActive = Column(Boolean, default=False)

    seller_id = Column(Integer, ForeignKey('user.id'))  # ForeignKey constrains data to match userId
    category_id = Column(Integer, ForeignKey('category.id'))

    seller = relationship("User", back_populates="listings")
    category = relationship("Category", backref="listings")
    photoPaths = relationship("PhotoPath", back_populates="listing", cascade="all, delete-orphan", passive_deletes=True)


class Message(Base):
    __tablename__ = 'message'

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey('user.id'))      # listing owner
    listing_id = Column(Integer, ForeignKey('listing.id'))  # corresponding listing
    timestamp = Column(DateTime)
    message = Column(String(256), index=True)  # 256 character message

    seller = relationship("User", back_populates="messages")


class PhotoPath(Base):
    __tablename__ = 'photo_path'

    id = Column(Integer, primary_key=True, index=True)
    path = Column(String(49))
    thumbnailPath = Column(String(49))

    listing_id = Column(Integer, ForeignKey("listing.id", ondelete="CASCADE"))

    listing = relationship("Listing", back_populates="photoPaths")


class Category(Base):
    __tablename__ = 'category'

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(32))
