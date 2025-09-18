import { useState } from "react";
import { Header } from "../components/Header";
import { ManwhaCard } from "../components/ManhwaCard";

export const LibraryPage = () => {
  const dummy = [
    {
      title: "I Am the Fated Villain",
      img: "https://gg.asuracomic.net/storage/media/10/conversions/55ae5b78-thumb-small.webp",
    },
    {
      title: "Solo Leveling: Ragnarok",
      img: "https://gg.asuracomic.net/storage/media/345171/conversions/01K2MD0YZRJ5VJT31MD5CARAVF-thumb-small.webp",
    },
    {
      title: "Pick Me Up, Infinite Gacha",
      img: "https://gg.asuracomic.net/storage/media/345813/conversions/01K2WWEGAH6NP3A12WQ1PA54Q6-thumb-small.webp",
    },
    {
      title: "Reaper of the Drifting Moon",
      img: "https://gg.asuracomic.net/storage/media/239/01J3BAPD40P84ZADHW46D5R6G7.webp",
    },
    {
      title: "Reborn on the Demonic Cult Bat...",
      img: "https://gg.asuracomic.net/storage/media/351283/conversions/01K4QEF1D1885N88T0RJB7R24W-thumb-small.webp",
    },
    {
      title: "The Max-Level Player's 100th R...",
      img: "https://gg.asuracomic.net/storage/media/150/conversions/74b617fc-thumb-small.webp",
    },
    {
      title: "Surviving The Game as a Barbar...",
      img: "https://gg.asuracomic.net/storage/media/125/conversions/ed5d5826-thumb-small.webp",
    },
    {
      title: "The Tutorial is Too Hard",
      img: "https://gg.asuracomic.net/storage/media/145/conversions/af610648-thumb-small.webp",
    },
    {
      title: "Doctor’s Rebirth",
      img: "https://gg.asuracomic.net/storage/media/171/conversions/28bb0778-thumb-small.webp",
    },
    {
      title: "Bloodhound's Regression Instin...",
      img: "https://gg.asuracomic.net/storage/media/314786/conversions/01JVNJXAC0NRT60FMFB8RATR3V-thumb-small.webp",
    },
    {
      title: "The Ultimate Shut-In",
      img: "https://gg.asuracomic.net/storage/media/346170/conversions/01K2ZSY8BZNAJPBG2MDF6DP5MX-thumb-small.webp",
    },
    {
      title: "Murim Login",
      img: "https://gg.asuracomic.net/storage/media/273/conversions/01J3QWG0P2B1T5RX1RB9G9D3AY-thumb-small.webp",
    },
    {
      title: "The Hero Starts Over at the Ac...",
      img: "https://gg.asuracomic.net/storage/media/287989/conversions/01JS08KRNK477X0DMWAK0SHGWH-thumb-small.webp",
    },
    {
      title: "The Regressed Mercenary's Mach...",
      img: "https://gg.asuracomic.net/storage/media/243966/conversions/01J9KCWWJBA7Z7P1XWYXX9MEZC-thumb-small.webp",
    },
    {
      title: "Insanely-Talented Player",
      img: "https://gg.asuracomic.net/storage/media/290486/conversions/01JSW8XZYKX9DMQDW4TGP54557-thumb-small.webp",
    },
    {
      title: "Emperor of Solo Play",
      img: "https://gg.asuracomic.net/storage/media/290904/conversions/01JT13YHF9ZTF19DG31MQR3PCX-thumb-small.webp",
    },
    {
      title: "I Killed an Academy Player",
      img: "https://gg.asuracomic.net/storage/media/336914/conversions/01JZV1C6AK5K04WV7VJHV0C0AR-thumb-small.webp",
    },
    {
      title: "Breakers",
      img: "https://gg.asuracomic.net/storage/media/347483/conversions/01K3GNYY3YPJ7EYAGAF5R9MED4-thumb-small.webp",
    },
    {
      title: "Infinite Mage",
      img: "https://gg.asuracomic.net/storage/media/103/conversions/9ab6b724-thumb-small.webp",
    },
    {
      title: "Dungeon Architect",
      img: "https://gg.asuracomic.net/storage/media/288219/conversions/01JS1YGRKZ41DGMR2DF4Y75H9W-thumb-small.webp",
    },
    {
      title: "Return of the Apocalypse-Class...",
      img: "https://gg.asuracomic.net/storage/media/341804/conversions/01K1GTTWD03N64QFD3K8YS0XBA-thumb-small.webp",
    },
    {
      title: "Logging 10,000 Years into the ...",
      img: "https://gg.asuracomic.net/storage/media/58/conversions/49ab5c70-thumb-small.webp",
    },
    {
      title: "Helmut: The Forsaken Child",
      img: "https://gg.asuracomic.net/storage/media/281334/conversions/01JPMXG103HRJGRE6VDY1FNW2E-thumb-small.webp",
    },
    {
      title: "Terminally-Ill Genius Dark Kni...",
      img: "https://gg.asuracomic.net/storage/media/206/conversions/2732f397-thumb-small.webp",
    },
    {
      title: "A Cadet Becomes a Prophet?!",
      img: "https://gg.asuracomic.net/storage/media/343421/conversions/01K238ZCSHNT4FJQKC7F6H5S0Y-thumb-small.webp",
    },
    {
      title: "The Illegitimate Who Devours W...",
      img: "https://gg.asuracomic.net/storage/media/283204/conversions/01JQ9F38EE3KFT2V79A3KCK0XH-thumb-small.webp",
    },
    {
      title: "Dragon-Devouring Mage",
      img: "https://gg.asuracomic.net/storage/media/346171/conversions/01K2ZSZ90DAXT3RQJNKVRAX6X0-thumb-small.webp",
    },
    {
      title: "A Dragonslayer's Peerless Regr...",
      img: "https://gg.asuracomic.net/storage/media/266162/01JJ78S117GDR2JEW066796E8B.gif",
    },
    {
      title: "Myst, Might, Mayhem",
      img: "https://gg.asuracomic.net/storage/media/237/conversions/01J3BANTCGYVH30PHD7H3PP3VK-thumb-small.webp",
    },
    {
      title: "Reincarnation of the Fist King",
      img: "https://gg.asuracomic.net/storage/media/339849/conversions/01K0VQPRSRDB0AME774RXW41N2-thumb-small.webp",
    },
    {
      title: "Magic Academy's Genius Blinker",
      img: "https://gg.asuracomic.net/storage/media/233/conversions/01J3BAK5BWJ0STX2RPY2A94GY4-thumb-small.webp",
    },
    {
      title: "Chronicles of the Lazy Soverei...",
      img: "https://gg.asuracomic.net/storage/media/350642/conversions/01K4J8PW7132G1J8XXEM13N9MW-thumb-small.webp",
    },
    {
      title: "The Cold-Blooded Warrior",
      img: "https://gg.asuracomic.net/storage/media/338697/conversions/01K0BZP37SEF4JSV0Y6HQ7NJCZ-thumb-small.webp",
    },
    {
      title: "Academy's Genius Swordmaster",
      img: "https://gg.asuracomic.net/storage/media/134/conversions/13623e9f-thumb-small.webp",
    },
    {
      title: "The Tang Clan Chronicles",
      img: "https://gg.asuracomic.net/storage/media/350643/conversions/01K4J921B3PYW9VQ7TWCJCEABY-thumb-small.webp",
    },
    {
      title: "The Last Adventurer",
      img: "https://gg.asuracomic.net/storage/media/154/conversions/94d5d66e-thumb-small.webp",
    },
    {
      title: "Absolute Sword Sense",
      img: "https://gg.asuracomic.net/storage/media/46/conversions/c20e9fb0-thumb-small.webp",
    },
    {
      title: "Standard of Reincarnation",
      img: "https://gg.asuracomic.net/storage/media/320387/conversions/01JXQW05XHG0JK1ZMMYAAGZ7JP-thumb-small.webp",
    },
    {
      title: "The Demonic Cult Instructor Re...",
      img: "https://gg.asuracomic.net/storage/media/343765/conversions/01K261G4W2VBC6TEGPMJ86BTW9-thumb-small.webp",
    },
    {
      title: "Player Who Can't Level Up",
      img: "https://gg.asuracomic.net/storage/media/263608/conversions/01JH5TBN2T87D48PVY7BD1TTNH-thumb-small.webp",
    },
    {
      title: "The Novel’s Extra (Remake)",
      img: "https://gg.asuracomic.net/storage/media/248267/conversions/01JBAVX953N5XQX9XRAGQMDBP4-thumb-small.webp",
    },
    {
      title: "The Indomitable Martial King",
      img: "https://gg.asuracomic.net/storage/media/266925/conversions/01JJHN0Z42F9DNQHJVED1WBBZK-thumb-small.webp",
    },
    {
      title: "God-Tier Extra's Ultimate Guid...",
      img: "https://gg.asuracomic.net/storage/media/339848/conversions/01K0VQMNET261ZPMEVVHQFN3V0-thumb-small.webp",
    },
    {
      title: "The Youngest Son of the Eunhae...",
      img: "https://gg.asuracomic.net/storage/media/336845/conversions/01JZTABQ7K56QYZSBA8QGKJR5Y-thumb-small.webp",
    },
    {
      title: "Trash of the Count’s Family",
      img: "https://gg.asuracomic.net/storage/media/267105/conversions/01JJNC19KJPFJVV6S6HJ6A1BZD-thumb-small.webp",
    },
    {
      title: "Mount Hua Sect's Genius Phanto...",
      img: "https://gg.asuracomic.net/storage/media/339801/conversions/01K0SK60JGY8VDJQQ2H7YJHHMW-thumb-small.webp",
    },
    {
      title: "Fated to Be Loved by Villains",
      img: "https://gg.asuracomic.net/storage/media/281318/conversions/01JPMWQMQEBZ7CFW5WV4G7H1VJ-thumb-small.webp",
    },
    {
      title: "Level 999 Goblin",
      img: "https://gg.asuracomic.net/storage/media/318519/conversions/01JX067TZ58R0DT7VRSWGP03AB-thumb-small.webp",
    },
    {
      title: "Academy’s Undercover Professor",
      img: "https://gg.asuracomic.net/storage/media/174/conversions/50a9b97c-thumb-small.webp",
    },
    {
      title: "Playing the Perfect Fox-Eyed V...",
      img: "https://gg.asuracomic.net/storage/media/283985/conversions/01JQJ43VN033V2ZBVAN94P7H9X-thumb-small.webp",
    },
  ];
  const [search, setSearch] = useState("");

  return (
    <div className="library-page page">
      <Header setSearch={setSearch} />
      <div className="container">
        {dummy.map((item, index) => {
          const { title, img } = item;
          if (title.toLocaleLowerCase().indexOf(search) === -1) return;
          return <ManwhaCard key={index} img_url={img} name={title} />;
        })}
      </div>
    </div>
  );
};
