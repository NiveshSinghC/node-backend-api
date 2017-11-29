const crypto = require('crypto-js');


module.exports.AESHash = function(key, lock){

    for (var k in lock) {

        if(typeof lock[k] == 'object'){
            lock[k] = crypto.AES.encrypt(JSON.stringify(lock[k]),key).toString()
        }
        else if(typeof lock[k] !== 'string'){
            lock[k] = crypto.AES.encrypt(lock[k].toString(),key).toString()
        }else{
            lock[k] = crypto.AES.encrypt(lock[k],key).toString()
        }
       
    }
    return lock;
}
module.exports.AESHashDecrypt = function(key, lock){
    for (var k in lock) {
        if(typeof lock[k] !== 'string'){
            lock[k] = crypto.AES.decrypt( lock[k].toString() ,key).toString(crypto.enc.Utf8)
        }else{
            lock[k] = crypto.AES.decrypt( lock[k],key).toString(crypto.enc.Utf8)
        }
        
    }
    return lock;
}

module.exports.AESHashDecryptOnlyOne = function(key, lock){
    
        if(typeof lock !== 'string'){
            lock = crypto.AES.decrypt(lock.toString(),key).toString(crypto.enc.Utf8)
        }else{
            lock = crypto.AES.decrypt(lock,key).toString(crypto.enc.Utf8)
        }
    return lock;
}

module.exports.AESHashOnlyOne = function(key, lock){
    
        if(typeof lock == 'object'){
            lock = crypto.AES.encrypt(JSON.stringify(lock),key).toString()
        }
        else if(typeof lock !== 'string'){
            lock = crypto.AES.encrypt(lock.toString(),key).toString()
        }else{
            lock = crypto.AES.encrypt(lock,key).toString()
        }
        
    return lock;
}

module.exports.SHA256Hash = function(hash){
    return crypto.SHA256(hash).toString();
}
/**
 * this line is for reference for use
 console.log(crypto.AES.decrypt(lock.ShopkeeperName,key).toString(crypto.enc.Utf8));
 */
