const express = require('express');
const passport = require('passport');
const crypto = require('crypto');
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');
const {User} = require('')