const config = require("./config");
const jointocreatemap = new Map();
module.exports = function (client) {
    const description = {
        name: "jointocreate",
        filename: "jointocreate.js",
        version: "3.2"
    }
     //GÜVENLİK DÖNGÜSÜ
  new Promise(resolve => {
    setInterval(() => {
      resolve(2);
        try{
          const guild = client.guilds.cache.get(config.guildid);
          const channels = guild.channels.cache.map(ch => ch.id)
          for (let i = 0; i < channels.length; i++) {
            const key = `tempvoicechannel_${guild.id}_${channels[i]}`;
            if (jointocreatemap.get(key)) {
              var vc = guild.channels.cache.get(jointocreatemap.get(key));
              if (vc.members.size < 1) {
                jointocreatemap.delete(key);
                return vc.delete();
              } else {}
            }
          }
      }catch{}
    }, 10000)
  })

    
//katılma/ayrılma kanallarını kontrol etmek için ses durumu güncelleme olayı
    client.on("voiceStateUpdate", (oldState, newState) => {
  // KANAL ADI DİZİNİ AYARLA
  //IGNORE BUT DONT DELETE!
  let oldparentname = "unknown"
  let oldchannelname = "unknown"
  let oldchanelid = "unknown"
  if (oldState && oldState.channel && oldState.channel.parent && oldState.channel.parent.name) oldparentname = oldState.channel.parent.name
  if (oldState && oldState.channel && oldState.channel.name) oldchannelname = oldState.channel.name
  if (oldState && oldState.channelID) oldchanelid = oldState.channelID
  let newparentname = "unknown"
  let newchannelname = "unknown"
  let newchanelid = "unknown"
  if (newState && newState.channel && newState.channel.parent && newState.channel.parent.name) newparentname = newState.channel.parent.name
  if (newState && newState.channel && newState.channel.name) newchannelname = newState.channel.name
  if (newState && newState.channelID) newchanelid = newState.channelID
  if (oldState.channelID) {
      if (typeof oldState.channel.parent !== "undefined")  oldChannelName = `${oldparentname}\n\t**${oldchannelname}**\n*${oldchanelid}*`
       else  oldChannelName = `-\n\t**${oldparentname}**\n*${oldchanelid}*`
  }
  if (newState.channelID) {
      if (typeof newState.channel.parent !== "undefined") newChannelName = `${newparentname}\n\t**${newchannelname}**\n*${newchanelid}*`
      else newChannelName = `-\n\t**${newchannelname}**\n*${newchanelid}*`
  }
  // KATILIM
  if (!oldState.channelID && newState.channelID) {
    if(newState.channelID !== config.JOINTOCREATECHANNEL) return;  //ortak createchannel atla değilse
    jointocreatechannel(newState);   //işlevi yükle
  }
  // ayrılma
  if (oldState.channelID && !newState.channelID) {
            //haritadan kanal kimliği oluşturmak için katılın
          if (jointocreatemap.get(`tempvoicechannel_${oldState.guild.id}_${oldState.channelID}`)) {
            //sunucudan getir
            var vc = oldState.guild.channels.cache.get(jointocreatemap.get(`tempvoicechannel_${oldState.guild.id}_${oldState.channelID}`));
            //kanal boyutu birin altındaysa
            if (vc.members.size < 1) {
              // sil
              jointocreatemap.delete(`tempvoicechannel_${oldState.guild.id}_${oldState.channelID}`);
              //silindiğini kaydet
              console.log(" :: " + oldState.member.user.username + "#" + oldState.member.user.discriminator + " :: Oda silindi")
              //ses kanalını sil
              return vc.delete();
          }
            else {
            }
          }
  }
  // değiştirme
  if (oldState.channelID && newState.channelID) {
 
    if (oldState.channelID !== newState.channelID) {
      //kanal oluşturmak için katılmak ise
      if(newState.channelID===config.JOINTOCREATECHANNEL)
      //yeni bir kanal yap
      jointocreatechannel(oldState); 
      //AMA aynı zamanda haritadaki bir kanalsa (geçici ses kanalı)
      if (jointocreatemap.get(`tempvoicechannel_${oldState.guild.id}_${oldState.channelID}`)) {
        //kanalı getir
        var vc = oldState.guild.channels.cache.get(jointocreatemap.get(`tempvoicechannel_${oldState.guild.id}_${oldState.channelID}`));
        //if the size is under 1
        if (vc.members.size < 1) {
          //haritadan sil
          jointocreatemap.delete(`tempvoicechannel_${oldState.guild.id}_${oldState.channelID}`);
         //konsola kaydet
          console.log(" :: " + oldState.member.user.username + "#" + oldState.member.user.discriminator + " :: Oda silindi")
        //odayı sil
          return vc.delete();
      }
      else {
      }
      }
    }
}
  })
    async function jointocreatechannel(user) {
      //konsola kaydet
      console.log(" :: " + user.member.user.username + "#" + user.member.user.discriminator + " :: Oda oluşturuldu")
      //user.member.user.send("Üyeye yeni bir oda oluşturulduğunu bildirmek için kullanılabilir")
      await user.guild.channels.create(`${user.member.user.username}' bla bla`, {
        type: 'voice',
        parent: user.channel.parent.id, //veya kategori kimliği olarak ayarlayın
      }).then(async vc => {
        //kullanıcıyı yeni kanala taşı
        user.setChannel(vc);
        //yeni kanalı haritaya ayarla
        jointocreatemap.set(`tempvoicechannel_${vc.guild.id}_${vc.id}`, vc.id);
        //kanalın izinlerini değiştir
        await vc.overwritePermissions([
          {
            id: user.id,
            allow: ['MANAGE_CHANNELS'],
          },
          {
            id: user.guild.id,
            allow: ['VIEW_CHANNEL'],
          },
        ]);
      })
    }
}
