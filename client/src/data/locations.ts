export interface LocationItem {
  country: string;
  countryCode: string;
  states: {
    name: string;
    places: string[];
  }[];
}

export const POPULAR_LOCATIONS: LocationItem[] = [
  {
    country: 'India',
    countryCode: 'IN',
    states: [
      {
        name: 'Andhra Pradesh',
        places: [
          'Machilipatnam',
          'Vijayawada',
          'Visakhapatnam (Vizag)',
          'Tirupati (Tirumala)',
          'Guntur',
          'Rajahmundry (Rajamahendravaram)',
          'Kakinada',
          'Nellore',
          'Kurnool',
          'Kadapa (YSR Cuddapah)',
          'Anantapur',
          'Eluru',
          'Ongole',
          'Chittoor',
          'Srikakulam',
          'Vizianagaram',
          'Bhimavaram',
          'Tenali',
          'Proddatur',
          'Nandyal',
          'Hindupur',
          'Adoni',
          'Madanapalle',
          'Gudivada',
          'Narasaraopet',
          'Tadepalligudem',
          'Dharmavaram',
          'Amaravati',
          'Araku Valley & Borra Caves',
          'Srisailam (Mallikarjuna Jyotirlinga)',
          'Lepakshi',
          'Gandikota (Grand Canyon of India)',
          'Horsley Hills',
          'Mypadu Beach',
          'Mangalagiri',
          'Chilakaluripet',
          'Kavali',
          'Palakollu',
          'Kandukur',
          'Bapatla & Suryalanka Beach',
          'Markapur',
          'Rayachoti',
          'Tanuku'
        ]
      },
      {
        name: 'Telangana',
        places: [
          'Hyderabad (Charminar, Golconda & Hitec City)',
          'Secunderabad',
          'Warangal (Thousand Pillar & Ramappa)',
          'Nizamabad',
          'Karimnagar',
          'Ramagundam',
          'Khammam',
          'Mahbubnagar',
          'Nalgonda',
          'Adilabad (Kuntala Falls)',
          'Suryapet',
          'Siddipet',
          'Miryalaguda',
          'Jagtial',
          'Nirmal',
          'Mancherial',
          'Kamareddy',
          'Kothagudem (Bhadrachalam)',
          'Bhongir (Yadagirigutta Temple)',
          'Ramoji Film City',
          'Nagarjuna Sagar Dam',
          'Basar Saraswati Temple',
          'Medak (Cathedral & Fort)'
        ]
      },
      {
        name: 'Kerala',
        places: [
          'Munnar',
          'Alleppey (Alappuzha Backwaters)',
          'Kochi (Fort Kochi & Marine Drive)',
          'Wayanad',
          'Varkala (Cliff Beach)',
          'Thekkady (Periyar Wildlife)',
          'Kovalam',
          'Thiruvananthapuram (Trivandrum)',
          'Kozhikode (Calicut)',
          'Thrissur (Cultural Capital)',
          'Kannur (Theyyam & Drive-in Beach)',
          'Kumarakom (Vembanad Lake)',
          'Bekal (Fort & Beach)',
          'Palakkad (Silent Valley)',
          'Kollam (Ashtamudi Lake)',
          'Vagamon (Pine Forests)',
          'Athirappilly Waterfalls',
          'Marari Beach',
          'Poovar Island',
          'Ponmudi Hills'
        ]
      },
      {
        name: 'Karnataka',
        places: [
          'Bengaluru (Bangalore)',
          'Mysuru (Mysore Palace)',
          'Hampi (UNESCO Ruins)',
          'Coorg (Madikeri Coffee Hills)',
          'Gokarna (Om Beach)',
          'Chikmagalur (Mullayanagiri)',
          'Mangalore (Panambur Beach)',
          'Udupi & Malpe Beach',
          'Hubballi-Dharwad',
          'Belagavi (Belgaum)',
          'Badami, Aihole & Pattadakal',
          'Dandeli (River Rafting)',
          'Kabini Wildlife Reserve',
          'Murudeshwar (Shiva Temple & Netrani)',
          'Shivamogga (Jog Falls)',
          'Bandipur National Park',
          'Nagarhole Safari',
          'Hassan (Belur & Halebidu Temples)',
          'Bijapur (Gol Gumbaz)'
        ]
      },
      {
        name: 'Tamil Nadu',
        places: [
          'Chennai (Marina Beach & Mylapore)',
          'Ooty (Nilgiri Toy Train)',
          'Kodaikanal (Princess of Hills)',
          'Madurai (Meenakshi Temple)',
          'Rameswaram (Pamban Bridge)',
          'Mahabalipuram (Shore Temple)',
          'Kanyakumari (Vivekananda Rock)',
          'Coimbatore',
          'Thanjavur (Brihadisvara Temple)',
          'Tiruchirappalli (Rockfort Trichy)',
          'Salem & Yercaud',
          'Tirunelveli',
          'Vellore (Golden Temple)',
          'Kumbakonam (Temple Town)',
          'Dhanushkodi (Ghost Town)',
          'Kanchipuram (Silk City)',
          'Tiruvannamalai (Arunachala)',
          'Courtallam (Waterfalls)',
          'Mudumalai National Park'
        ]
      },
      {
        name: 'Goa',
        places: [
          'North Goa (Calangute, Baga & Candolim)',
          'North Goa (Anjuna, Vagator & Chapora Fort)',
          'North Goa (Morjim, Ashwem & Arambol)',
          'South Goa (Palolem, Agonda & Butterfly Beach)',
          'South Goa (Colva, Benaulim & Cavelossim)',
          'Panaji (Fontainhas Latin Quarter)',
          'Old Goa (Basilica of Bom Jesus)',
          'Dudhsagar Waterfalls Trek',
          'Vasco da Gama & Bogmalo Beach',
          'Margao'
        ]
      },
      {
        name: 'Rajasthan',
        places: [
          'Jaipur (Pink City, Amber Fort & Hawa Mahal)',
          'Udaipur (City of Lakes & Lake Pichola)',
          'Jodhpur (Blue City & Mehrangarh Fort)',
          'Jaisalmer (Golden Fort & Sam Sand Dunes)',
          'Pushkar (Brahma Temple & Sacred Lake)',
          'Mount Abu (Dilwara Temples & Nakki Lake)',
          'Bikaner (Junagarh Fort & Karni Mata)',
          'Ranthambore National Park (Tiger Safari)',
          'Chittorgarh Fort',
          'Ajmer (Sharif Dargah)',
          'Alwar & Sariska Tiger Reserve',
          'Kumbhalgarh Fort',
          'Shekhawati (Mandawa Havelis)',
          'Bundi'
        ]
      },
      {
        name: 'Himachal Pradesh',
        places: [
          'Manali & Solang Valley',
          'Shimla & Kufri Ridge',
          'Dharamshala & McLeodGanj',
          'Spiti Valley (Kaza, Key & Chandratal)',
          'Kasol & Parvati Valley',
          'Dalhousie & Khajjiar (Mini Switzerland)',
          'Bir Billing (World Paragliding Hub)',
          'Jibhi & Tirthan Valley',
          'Kullu Valley',
          'Kasauli',
          'Kinnaur (Kalpa, Chitkul & Sangla)'
        ]
      },
      {
        name: 'Uttarakhand',
        places: [
          'Rishikesh (Yoga & White Water Rafting)',
          'Haridwar (Ganga Aarti)',
          'Mussoorie & Kempty Falls',
          'Nainital & Bhimtal Lakes',
          'Jim Corbett National Park Safari',
          'Auli (Snow Skiing & Ropeway)',
          'Kedarnath Dham',
          'Badrinath Dham',
          'Chopta & Tungnath Trek',
          'Dehradun & Robber\'s Cave',
          'Almora & Ranikhet',
          'Lansdowne',
          'Valley of Flowers & Hemkund Sahib'
        ]
      },
      {
        name: 'Jammu & Kashmir & Ladakh',
        places: [
          'Srinagar (Dal Lake Shikara & Mughal Gardens)',
          'Gulmarg (Gondola Snow Cable Car)',
          'Pahalgam (Betaab & Aru Valleys)',
          'Sonamarg (Meadow of Gold)',
          'Leh (Shanti Stupa & Leh Palace)',
          'Nubra Valley (Hunder Sand Dunes & Camels)',
          'Pangong Tso Lake',
          'Kargil & Zanskar Valley',
          'Katra (Maa Vaishno Devi Shrine)',
          'Patnitop Hills',
          'Doodhpathri'
        ]
      },
      {
        name: 'Maharashtra',
        places: [
          'Mumbai (Gateway of India, Marine Drive)',
          'Pune (Sinhagad & Koregaon Park)',
          'Lonavala & Khandala Ghats',
          'Mahabaleshwar & Panchgani',
          'Alibaug & Kashid Beach',
          'Shirdi (Sai Baba Temple)',
          'Nashik (Sula Vineyards & Trimbakeshwar)',
          'Chhatrapati Sambhajinagar (Ajanta & Ellora Caves)',
          'Kolhapur (Mahalakshmi Temple)',
          'Nagpur',
          'Matheran (Eco Hill Station)',
          'Tarkarli & Malvan (Scuba Diving)',
          'Igatpuri & Bhandardara',
          'Tadoba-Andhari Tiger Reserve'
        ]
      },
      {
        name: 'Gujarat',
        places: [
          'Ahmedabad (Sabarmati Ashram & Heritage)',
          'Rann of Kutch (White Salt Desert & Rann Utsav)',
          'Statue of Unity (Kevadia)',
          'Dwarka (Dwarkadhish Temple)',
          'Somnath (First Jyotirlinga)',
          'Gir National Park (Asiatic Lions)',
          'Surat',
          'Vadodara (Laxmi Vilas Palace)',
          'Rajkot',
          'Bhuj (Kutch Heritage)',
          'Saputara Hill Station',
          'Diu Island & Fortress'
        ]
      },
      {
        name: 'Delhi NCR & Uttar Pradesh',
        places: [
          'New Delhi & Old Delhi',
          'Agra (Taj Mahal & Agra Fort)',
          'Varanasi (Kashi Vishwanath & Dashashwamedh Ghat)',
          'Ayodhya (Ram Janmabhoomi Mandir)',
          'Mathura & Vrindavan (Banke Bihari)',
          'Lucknow (Awadhi Culinary & Bara Imambara)',
          'Prayagraj (Triveni Sangam)',
          'Jhansi & Orchha',
          'Fatehpur Sikri',
          'Sarnath (Buddhist Heritage)',
          'Noida',
          'Gurugram (Gurgaon)'
        ]
      },
      {
        name: 'West Bengal & Odisha & Sikkim',
        places: [
          'Kolkata (Victoria Memorial & Howrah Bridge)',
          'Darjeeling & Tiger Hill Sunrise',
          'Gangtok & Tsomgo Lake',
          'Pelling & Kanchenjunga View',
          'Kalimpong',
          'Sundarbans Mangrove Tiger Safari',
          'Digha & Mandarmani Beaches',
          'Puri (Jagannath Temple & Golden Beach)',
          'Bhubaneswar (Temple City of India)',
          'Konark (Sun Temple)',
          'Chilika Lake (Dolphin Sanctuary)'
        ]
      },
      {
        name: 'Northeast India',
        places: [
          'Shillong (Scotland of the East)',
          'Cherrapunji & Nohkalikai Falls',
          'Dawki (Umngot Clear River) & Mawlynnong',
          'Kaziranga National Park (One-horned Rhinos)',
          'Guwahati (Kamakhya Temple)',
          'Tawang Monastery & Sela Pass',
          'Ziro Valley',
          'Majuli (World\'s Largest River Island)',
          'Kohima & Dzukou Valley Trek'
        ]
      },
      {
        name: 'Madhya Pradesh & Chhattisgarh',
        places: [
          'Khajuraho (UNESCO Erotic Temples)',
          'Ujjain (Mahakaleshwar Jyotirlinga)',
          'Indore (Sarafa Bazaar & 56 Dukan)',
          'Bhopal & Sanchi Stupa',
          'Gwalior Fort',
          'Pachmarhi (Queen of Satpura)',
          'Bandhavgarh & Kanha National Parks',
          'Jabalpur (Bhedaghat Marble Rocks & Dhuandhar)',
          'Orchha (Betwa River Palaces)',
          'Mandu (Jahaz Mahal)',
          'Raipur & Bastar (Chitrakote Falls)'
        ]
      },
      {
        name: 'Andaman & Nicobar Islands',
        places: [
          'Havelock Island (Swaraj Dweep & Radhanagar Beach)',
          'Neil Island (Shaheed Dweep & Natural Bridge)',
          'Port Blair (Cellular Jail Light & Sound)',
          'Baratang Island (Mud Volcano & Limestone Caves)',
          'Ross Island (Netaji Subhash Chandra Bose Dweep)'
        ]
      },
      {
        name: 'Puducherry & Punjab & Bihar',
        places: [
          'Puducherry (Auroville & French White Town)',
          'Amritsar (Golden Temple & Wagah Border)',
          'Chandigarh (Rock Garden & Sukhna Lake)',
          'Bodh Gaya (Mahabodhi Temple & Bodhi Tree)',
          'Nalanda University Ruins & Rajgir',
          'Patna Sahib'
        ]
      }
    ]
  },
  {
    country: 'Japan',
    countryCode: 'JP',
    states: [
      { name: 'Kanto (Tokyo)', places: ['Tokyo (Shinjuku & Shibuya)', 'Yokohama', 'Hakone (Mt Fuji Views)', 'Kamakura', 'Nikko'] },
      { name: 'Kansai', places: ['Kyoto (Fushimi Inari & Arashiyama)', 'Osaka (Dotonbori)', 'Nara Deer Park', 'Kobe'] },
      { name: 'Hokkaido', places: ['Sapporo', 'Otaru Canal', 'Hakodate', 'Furano Lavender Fields'] },
      { name: 'Chubu', places: ['Mount Fuji Area', 'Takayama Old Town', 'Kanazawa (Kenrokuen)', 'Nagoya'] }
    ]
  },
  {
    country: 'Switzerland',
    countryCode: 'CH',
    states: [
      { name: 'Bernese Oberland', places: ['Interlaken', 'Grindelwald First', 'Lauterbrunnen Valley', 'Murren & Jungfraujoch'] },
      { name: 'Valais', places: ['Zermatt (Matterhorn)', 'Saas-Fee', 'Verbier'] },
      { name: 'Lucerne & Central', places: ['Lucerne (Chapel Bridge)', 'Mount Titlis', 'Mount Pilatus', 'Zug'] },
      { name: 'Zurich & Geneva', places: ['Zurich Old Town', 'Geneva Lake', 'Montreux (Chillon)', 'Lausanne'] }
    ]
  },
  {
    country: 'United Arab Emirates',
    countryCode: 'AE',
    states: [
      { name: 'Dubai', places: ['Downtown Dubai (Burj Khalifa)', 'Dubai Marina & JBR', 'Palm Jumeirah', 'Old Dubai & Gold Souk'] },
      { name: 'Abu Dhabi', places: ['Yas Island (Ferrari World)', 'Saadiyat Island', 'Sheikh Zayed Grand Mosque'] },
      { name: 'Ras Al Khaimah', places: ['Jebel Jais Zipline', 'Marjan Island'] }
    ]
  },
  {
    country: 'Thailand',
    countryCode: 'TH',
    states: [
      { name: 'Bangkok', places: ['Sukhumvit', 'Siam Square', 'Grand Palace & Wat Pho', 'Chao Phraya Riverside'] },
      { name: 'Phuket', places: ['Patong Beach', 'Kata & Karon', 'Old Phuket Town', 'Phi Phi Islands Day Trip'] },
      { name: 'Krabi', places: ['Ao Nang', 'Railay Beach', 'Koh Lanta'] },
      { name: 'Chiang Mai', places: ['Old City Chiang Mai', 'Nimman', 'Doi Suthep'] },
      { name: 'Surat Thani', places: ['Koh Samui', 'Koh Phangan', 'Koh Tao'] }
    ]
  },
  {
    country: 'France',
    countryCode: 'FR',
    states: [
      { name: 'Île-de-France', places: ['Paris (Eiffel Tower & Louvre)', 'Versailles Palace', 'Fontainebleau'] },
      { name: "French Riviera", places: ['Nice Promenade', 'Cannes', 'Marseille', 'Aix-en-Provence', 'Monaco'] },
      { name: 'Alps & Rhone', places: ['Chamonix-Mont-Blanc', 'Lyon', 'Annecy Lake'] }
    ]
  },
  {
    country: 'Italy',
    countryCode: 'IT',
    states: [
      { name: 'Lazio', places: ['Rome (Colosseum & Trevi)', 'Vatican City', 'Tivoli'] },
      { name: 'Tuscany', places: ['Florence (Duomo)', 'Siena', 'Pisa (Leaning Tower)', 'Chianti Wine Region'] },
      { name: 'Veneto', places: ['Venice (Grand Canal)', 'Verona', 'Dolomites (Cortina)'] },
      { name: 'Campania', places: ['Amalfi Coast (Positano & Ravello)', 'Naples', 'Capri Island', 'Pompeii'] }
    ]
  },
  {
    country: 'Indonesia',
    countryCode: 'ID',
    states: [
      { name: 'Bali', places: ['Ubud (Tegallalang & Monkey Forest)', 'Seminyak & Canggu', 'Uluwatu Temple & Sunset', 'Nusa Penida Island', 'Kintamani & Mount Batur'] },
      { name: 'Lombok', places: ['Gili Trawangan', 'Gili Air', 'Mount Rinjani', 'Kuta Lombok'] }
    ]
  },
  {
    country: 'United Kingdom',
    countryCode: 'GB',
    states: [
      { name: 'Greater London', places: ['Central London (Big Ben & Soho)', 'Westminster', 'Greenwich'] },
      { name: 'Scotland', places: ['Edinburgh Old Town & Castle', 'Scottish Highlands & Isle of Skye', 'Glasgow'] }
    ]
  },
  {
    country: 'United States',
    countryCode: 'US',
    states: [
      { name: 'New York', places: ['New York City (Manhattan & Central Park)', 'Brooklyn', 'Niagara Falls'] },
      { name: 'California', places: ['San Francisco (Golden Gate)', 'Los Angeles (Hollywood)', 'San Diego', 'Yosemite National Park'] },
      { name: 'Nevada & Arizona', places: ['Las Vegas Strip', 'Grand Canyon National Park', 'Sedona Red Rocks'] }
    ]
  }
];

export interface SelectedLocation {
  country: string;
  state: string;
  place: string;
  formatted: string;
}
