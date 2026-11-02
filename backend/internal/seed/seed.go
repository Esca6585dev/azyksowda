package seed

import (
	"fmt"
	"log"
	"time"

	"azyksowda/internal/config"
	"azyksowda/internal/models"
	"azyksowda/internal/utils"

	"gorm.io/gorm"
)

type seedCategory struct {
	Name, Emoji, Color, Description string
}

type seedProduct struct {
	Cat      int
	Name     string
	Brand    string
	Price    float64
	OldPrice float64
	Weight   string
	Unit     string
	Emoji    string
	Featured bool
}

var categories = []seedCategory{
	{"Miweler", "🍎", "#ef4444", "Täze we süýji miweler, her gün bazardan"},
	{"Gök önümler", "🥕", "#22c55e", "Ýerli daýhan hojalyklaryndan täze gök önümler"},
	{"Süýt önümleri", "🥛", "#3b82f6", "Süýt, gatyk, peýnir, mesge we ýogurtlar"},
	{"Et we ýumurtga", "🍗", "#f97316", "Täze et, towuk, kolbasa we ýumurtga"},
	{"Çörek we konditer", "🍞", "#d97706", "Täze bişirilen çörek, köke we tortlar"},
	{"Içgiler", "🥤", "#06b6d4", "Suw, şireler, gazly içgiler"},
	{"Çaý we kofe", "☕", "#92400e", "Dünýä belli markalaryň çaý we kofeleri"},
	{"Süýjüler", "🍫", "#a855f7", "Şokolad, konfet, bal we halwa"},
	{"Çipsi we hoz", "🥜", "#eab308", "Çipsi, çigit, hoz we gurak miweler"},
	{"Däneli we makaron", "🍝", "#f59e0b", "Un, tüwi, makaron, ýag we şeker"},
	{"Konserwler", "🥫", "#64748b", "Konserwler, souslar we maýonez"},
	{"Doňdurylan önümler", "🧊", "#38bdf8", "Pelmeni, doňdurma we doňdurylan gök önümler"},
	{"Arassaçylyk we öý", "🧴", "#14b8a6", "Kir ýuwujy, sabyn, şampun we öý harytlary"},
	{"Çaga önümleri", "👶", "#ec4899", "Pampers, çaga iýmiti we ideg serişdeleri"},
}

var products = []seedProduct{
	// ---- Miweler (0) ----
	{0, "Alma gyzyl", "", 15, 0, "1 kg", "kg", "🍎", true},
	{0, "Alma ýaşyl Granny Smith", "", 14, 0, "1 kg", "kg", "🍏", false},
	{0, "Banan", "", 25, 28, "1 kg", "kg", "🍌", true},
	{0, "Apelsin", "", 22, 0, "1 kg", "kg", "🍊", false},
	{0, "Mandarin", "", 20, 24, "1 kg", "kg", "🍊", false},
	{0, "Limon", "", 25, 0, "1 kg", "kg", "🍋", false},
	{0, "Üzüm gara", "", 18, 0, "1 kg", "kg", "🍇", false},
	{0, "Üzüm ak kişmiş", "", 20, 0, "1 kg", "kg", "🍇", false},
	{0, "Nar", "", 20, 0, "1 kg", "kg", "🍎", false},
	{0, "Garpyz", "", 3, 0, "1 kg", "kg", "🍉", true},
	{0, "Gawun Waharman", "", 5, 0, "1 kg", "kg", "🍈", true},
	{0, "Erik", "", 12, 0, "1 kg", "kg", "🍑", false},
	{0, "Şetdaly", "", 18, 0, "1 kg", "kg", "🍑", false},
	{0, "Armyt", "", 16, 0, "1 kg", "kg", "🍐", false},
	{0, "Kiwi", "", 30, 0, "1 kg", "kg", "🥝", false},
	{0, "Ananas", "", 45, 52, "1 sany", "sany", "🍍", false},
	{0, "Ülje", "", 20, 0, "1 kg", "kg", "🍒", false},
	{0, "Ýer tudanasy", "", 35, 0, "1 kg", "kg", "🍓", false},
	{0, "Awokado", "", 18, 0, "1 sany", "sany", "🥑", false},
	{0, "Mango", "", 30, 0, "1 sany", "sany", "🥭", false},

	// ---- Gök önümler (1) ----
	{1, "Kartoşka", "", 6, 0, "1 kg", "kg", "🥔", true},
	{1, "Sogan", "", 4, 0, "1 kg", "kg", "🧅", false},
	{1, "Käşir", "", 5, 0, "1 kg", "kg", "🥕", false},
	{1, "Pomidor", "", 10, 12, "1 kg", "kg", "🍅", true},
	{1, "Hyýar", "", 8, 0, "1 kg", "kg", "🥒", false},
	{1, "Kelem ak", "", 4, 0, "1 kg", "kg", "🥬", false},
	{1, "Bulgar burç gyzyl", "", 15, 0, "1 kg", "kg", "🫑", false},
	{1, "Badamjan", "", 8, 0, "1 kg", "kg", "🍆", false},
	{1, "Kädi", "", 5, 0, "1 kg", "kg", "🎃", false},
	{1, "Sarymsak", "", 20, 0, "1 kg", "kg", "🧄", false},
	{1, "Ukrop", "", 2, 0, "1 desse", "sany", "🌿", false},
	{1, "Petruşka", "", 2, 0, "1 desse", "sany", "🌿", false},
	{1, "Gök sogan", "", 2, 0, "1 desse", "sany", "🌿", false},
	{1, "Şugundyr", "", 5, 0, "1 kg", "kg", "🍠", false},
	{1, "Turp", "", 6, 0, "1 kg", "kg", "🥬", false},
	{1, "Kabaçok", "", 7, 0, "1 kg", "kg", "🥒", false},
	{1, "Brokkoli", "", 25, 0, "1 kg", "kg", "🥦", false},
	{1, "Gülkelem", "", 15, 0, "1 kg", "kg", "🥦", false},
	{1, "Ysmanak", "", 3, 0, "1 desse", "sany", "🥬", false},
	{1, "Mekgejöwen täze", "", 4, 0, "1 sany", "sany", "🌽", false},
	{1, "Şampinýon kömelek", "", 30, 0, "1 kg", "kg", "🍄", false},
	{1, "Ajy burç", "", 3, 0, "100 gr", "sany", "🌶️", false},

	// ---- Süýt önümleri (2) ----
	{2, "Uslada ýogurt 1.2%", "Uslada", 5, 0, "95 gr", "sany", "🥛", false},
	{2, "Aýaz Baba mesge ýagy 82.5%", "Aýaz Baba", 39, 0, "200 gr", "sany", "🧈", true},
	{2, "Şedroe Leto margarin", "Şedroe Leto", 33, 0, "500 gr", "sany", "🧈", false},
	{2, "Şedroe Leto margarin", "Şedroe Leto", 14, 0, "200 gr", "sany", "🧈", false},
	{2, "Sliwoçnyý margarin", "", 7, 0, "180 gr", "sany", "🧈", false},
	{2, "Elin süýt 2.5%", "Elin", 12, 0, "1 L", "sany", "🥛", true},
	{2, "Elin gatyk", "Elin", 8, 0, "500 gr", "sany", "🥛", false},
	{2, "Elin gaýmak", "Elin", 15, 0, "200 gr", "sany", "🥛", false},
	{2, "Elin kefir 2.5%", "Elin", 10, 0, "1 L", "sany", "🥛", false},
	{2, "Elin smetana 20%", "Elin", 18, 0, "400 gr", "sany", "🥛", false},
	{2, "Peýnir Rossiýskiý", "", 85, 95, "1 kg", "kg", "🧀", true},
	{2, "Hochland eredilen peýnir", "Hochland", 25, 0, "150 gr", "sany", "🧀", false},
	{2, "Dorog 5%", "", 14, 0, "250 gr", "sany", "🥛", false},
	{2, "Çudo ýogurt ülje", "Çudo", 11, 0, "290 gr", "sany", "🥛", false},
	{2, "Danone Aktiwia", "Danone", 7, 0, "130 gr", "sany", "🥛", false},
	{2, "Süýt tozy", "", 45, 0, "400 gr", "sany", "🥛", false},
	{2, "Mozzarella peýnir", "", 30, 0, "125 gr", "sany", "🧀", false},

	// ---- Et we ýumurtga (3) ----
	{3, "Goýun eti", "", 90, 0, "1 kg", "kg", "🥩", true},
	{3, "Sygyr eti", "", 80, 0, "1 kg", "kg", "🥩", false},
	{3, "Sygyr eti üwelen", "", 75, 0, "1 kg", "kg", "🥩", false},
	{3, "Towuk budy", "", 35, 38, "1 kg", "kg", "🍗", true},
	{3, "Towuk döşi file", "", 48, 0, "1 kg", "kg", "🍗", false},
	{3, "Towuk ganaty", "", 30, 0, "1 kg", "kg", "🍗", false},
	{3, "Bütin towuk", "", 32, 0, "1 kg", "kg", "🍗", false},
	{3, "Kolbasa Doktorskaýa", "", 45, 0, "500 gr", "sany", "🌭", false},
	{3, "Sosiska süýtli", "", 55, 0, "1 kg", "kg", "🌭", false},
	{3, "Serwelat", "", 60, 0, "400 gr", "sany", "🥓", false},
	{3, "Kakadylan towuk", "", 55, 0, "300 gr", "sany", "🍖", false},
	{3, "Gorbuşa balyk", "", 60, 0, "1 kg", "kg", "🐟", false},
	{3, "Ýumurtga", "", 18, 0, "10 sany", "sany", "🥚", true},
	{3, "Ýumurtga", "", 50, 54, "30 sany", "sany", "🥚", false},
	{3, "Bedene ýumurtgasy", "", 15, 0, "20 sany", "sany", "🥚", false},

	// ---- Çörek we konditer (4) ----
	{4, "Ak çörek", "", 1.5, 0, "1 sany", "sany", "🍞", true},
	{4, "Tamdyr çörek", "", 4, 0, "1 sany", "sany", "🫓", true},
	{4, "Baton", "", 3, 0, "1 sany", "sany", "🥖", false},
	{4, "Lawaş", "", 6, 0, "5 sany", "sany", "🫓", false},
	{4, "Buhanka gara çörek", "", 2.5, 0, "1 sany", "sany", "🍞", false},
	{4, "Ülker Ikram köke gara şokoladly", "Ülker", 10, 0, "1 sany", "sany", "🍪", false},
	{4, "Ülker Çizi Viç köke", "Ülker", 10, 0, "82 gr", "sany", "🍪", false},
	{4, "Ülker Biskrem", "Ülker", 12, 0, "100 gr", "sany", "🍪", false},
	{4, "Ülker Halley", "Ülker", 25, 29, "300 gr", "sany", "🍫", false},
	{4, "Jubileýnoýe köke", "", 9, 0, "125 gr", "sany", "🍪", false},
	{4, "Tort Napoleon", "", 65, 0, "1 kg", "kg", "🍰", false},
	{4, "Tort Medowik", "", 60, 0, "1 kg", "kg", "🍰", false},
	{4, "Pişme", "", 35, 0, "1 kg", "kg", "🥨", false},
	{4, "Kruassan şokoladly", "", 5, 0, "1 sany", "sany", "🥐", false},
	{4, "Suhari wanilli", "", 7, 0, "200 gr", "sany", "🍞", false},
	{4, "Keks kişmişli", "", 4, 0, "100 gr", "sany", "🧁", false},

	// ---- Içgiler (5) ----
	{5, "Coca Cola", "Coca Cola", 11, 0, "1 L", "sany", "🥤", true},
	{5, "Coca Cola", "Coca Cola", 6, 0, "0.5 L", "sany", "🥤", false},
	{5, "Fanta apelsin", "Fanta", 11, 0, "1 L", "sany", "🥤", false},
	{5, "Sprite", "Sprite", 11, 0, "1 L", "sany", "🥤", false},
	{5, "Arçalyk Kola", "Arçalyk", 5, 0, "1.5 L", "sany", "🥤", false},
	{5, "Arçalyk Powrize gazly suw", "Arçalyk", 3, 0, "0.5 L", "sany", "💧", false},
	{5, "Cola Çynar", "Çynar", 5, 0, "0.5 L", "sany", "🥤", false},
	{5, "Cola Çynar", "Çynar", 8, 0, "1 L", "sany", "🥤", false},
	{5, "Goşa çynar", "Çynar", 5, 0, "0.5 L", "sany", "🥤", false},
	{5, "7 Gün şetdaly", "7 Gün", 5, 0, "330 ml", "sany", "🧃", false},
	{5, "7 Gün tropik", "7 Gün", 5, 0, "330 ml", "sany", "🧃", false},
	{5, "Jos şetdaly şire", "Jos", 10, 12, "0.97 L", "sany", "🧃", true},
	{5, "Jos smorodina şire", "Jos", 10, 0, "0.97 L", "sany", "🧃", false},
	{5, "Jos alma şire", "Jos", 10, 0, "0.97 L", "sany", "🧃", false},
	{5, "Jos pomidor şire", "Jos", 10, 0, "0.97 L", "sany", "🧃", false},
	{5, "Berzeňňi mineral suw", "Berzeňňi", 4, 0, "1.5 L", "sany", "💧", false},
	{5, "Berzeňňi gazsyz suw", "Berzeňňi", 2, 0, "0.5 L", "sany", "💧", false},
	{5, "Red Bull energetik", "Red Bull", 18, 0, "250 ml", "sany", "🥤", false},
	{5, "Lipton buzly çaý limon", "Lipton", 12, 0, "1 L", "sany", "🧃", false},
	{5, "Nar şiresi tebigy", "", 15, 0, "1 L", "sany", "🧃", false},

	// ---- Çaý we kofe (6) ----
	{6, "MacCoffee sary 3/1", "MacCoffee", 3, 0, "20 gr", "sany", "☕", true},
	{6, "Jacobs Monarch çüýşe", "Jacobs", 69, 75, "95 gr", "sany", "☕", true},
	{6, "Jacobs Monarch çüýşe", "Jacobs", 48, 0, "47.5 gr", "sany", "☕", false},
	{6, "Jacobs Latte 3/1", "Jacobs", 3, 0, "12 gr", "sany", "☕", false},
	{6, "Nescafe Classic", "Nescafe", 55, 0, "100 gr", "sany", "☕", false},
	{6, "Nescafe Gold", "Nescafe", 85, 0, "95 gr", "sany", "☕", false},
	{6, "Nescafe 3/1 Classic", "Nescafe", 2.5, 0, "16 gr", "sany", "☕", false},
	{6, "Ahmad Tea gara çaý", "Ahmad Tea", 25, 0, "100 gr", "sany", "🍵", false},
	{6, "Ahmad Tea gök çaý", "Ahmad Tea", 25, 0, "100 gr", "sany", "🍵", false},
	{6, "Greenfield Earl Grey", "Greenfield", 22, 0, "25 paket", "sany", "🍵", false},
	{6, "Lipton gara çaý", "Lipton", 45, 0, "100 paket", "sany", "🍵", false},
	{6, "Gunça gök çaý", "Gunça", 30, 0, "250 gr", "sany", "🍵", true},
	{6, "Tess Pleasure", "Tess", 30, 0, "100 gr", "sany", "🍵", false},
	{6, "Richard Royal Ceylon", "Richard", 28, 0, "25 paket", "sany", "🍵", false},
	{6, "Nesquik kakao", "Nestle", 35, 0, "250 gr", "sany", "🍫", false},

	// ---- Süýjüler (7) ----
	{7, "Snickers Super şokolad 2-li", "Snickers", 17, 0, "1 sany", "sany", "🍫", true},
	{7, "Snickers", "Snickers", 9, 0, "50 gr", "sany", "🍫", false},
	{7, "Mars", "Mars", 9, 0, "51 gr", "sany", "🍫", false},
	{7, "Twix", "Twix", 9, 0, "55 gr", "sany", "🍫", false},
	{7, "KitKat", "Nestle", 9, 0, "41.5 gr", "sany", "🍫", false},
	{7, "Alpen Gold kişmişli şokolad", "Alpen Gold", 18, 21, "90 gr", "sany", "🍫", true},
	{7, "Alpen Gold süýtli şokolad", "Alpen Gold", 18, 0, "90 gr", "sany", "🍫", false},
	{7, "Milka süýtli şokolad", "Milka", 25, 0, "90 gr", "sany", "🍫", false},
	{7, "Roshen Lacmi", "Roshen", 20, 0, "90 gr", "sany", "🍫", false},
	{7, "Haribo Goldbären", "Haribo", 15, 0, "100 gr", "sany", "🍬", false},
	{7, "Orbit nahana", "Orbit", 3, 0, "1 sany", "sany", "🍬", false},
	{7, "Dirol", "Dirol", 3, 0, "1 sany", "sany", "🍬", false},
	{7, "Chupa Chups", "Chupa Chups", 1.5, 0, "1 sany", "sany", "🍭", false},
	{7, "Nutella", "Ferrero", 55, 0, "350 gr", "sany", "🍫", false},
	{7, "Merci", "Merci", 65, 0, "250 gr", "sany", "🍫", false},
	{7, "Raffaello", "Ferrero", 60, 68, "150 gr", "sany", "🍬", false},
	{7, "Ferrero Rocher", "Ferrero", 95, 0, "200 gr", "sany", "🍫", false},
	{7, "Halwa günebakar", "", 20, 0, "500 gr", "sany", "🍯", false},
	{7, "Rahat lukum", "", 15, 0, "300 gr", "sany", "🍬", false},
	{7, "M&M's", "M&M's", 9, 0, "45 gr", "sany", "🍬", false},
	{7, "Bal tebigy", "", 60, 0, "500 gr", "sany", "🍯", true},

	// ---- Çipsi we hoz (8) ----
	{8, "Tükel çipsi gyzyl bulgar", "Tükel", 16, 0, "120 gr", "sany", "🍟", false},
	{8, "Tükel çipsi peýnirli", "Tükel", 16, 0, "120 gr", "sany", "🍟", false},
	{8, "Lay's gaýmakly", "Lay's", 18, 0, "90 gr", "sany", "🍟", true},
	{8, "Pringles Original", "Pringles", 35, 0, "165 gr", "sany", "🍟", false},
	{8, "Ermak günebakar çigit", "Ermak", 20, 0, "100 gr", "sany", "🌻", false},
	{8, "Martin duzsuz gara çigit gyzyl", "Martin", 15, 0, "100 gr", "sany", "🌻", false},
	{8, "Martin duzly gara çigit gök", "Martin", 15, 0, "100 gr", "sany", "🌻", false},
	{8, "Jumbo çigit", "Jumbo", 12, 0, "100 gr", "sany", "🌻", false},
	{8, "Arahis duzly", "", 10, 0, "100 gr", "sany", "🥜", false},
	{8, "Pisse", "", 35, 0, "100 gr", "sany", "🥜", true},
	{8, "Badam", "", 40, 0, "100 gr", "sany", "🌰", false},
	{8, "Hoz", "", 30, 0, "100 gr", "sany", "🌰", false},
	{8, "Kişmiş", "", 25, 0, "500 gr", "sany", "🍇", false},
	{8, "Gurak erik kaýsy", "", 30, 0, "500 gr", "sany", "🍑", false},
	{8, "Popkorn peýnirli", "", 8, 0, "100 gr", "sany", "🍿", false},
	{8, "Suharik 3 Koroçki", "", 4, 0, "70 gr", "sany", "🍞", false},

	// ---- Däneli we makaron (9) ----
	{9, "Şeker", "", 16, 0, "1 kg", "kg", "🍚", true},
	{9, "Günebakar ýagy", "Oleýna", 18, 20, "1 L", "sany", "🍶", true},
	{9, "Pagta ýagy", "", 15, 0, "1 L", "sany", "🍶", false},
	{9, "Zeýtun ýagy Extra Virgin", "", 65, 0, "500 ml", "sany", "🫒", false},
	{9, "Tüwi Laser", "", 14, 0, "1 kg", "kg", "🍚", false},
	{9, "Tüwi uzyn Basmati", "", 18, 0, "1 kg", "kg", "🍚", false},
	{9, "Un ýokary sort", "", 10, 0, "2 kg", "sany", "🌾", false},
	{9, "Un ýokary sort", "", 24, 0, "5 kg", "sany", "🌾", false},
	{9, "Greçka", "", 22, 0, "1 kg", "kg", "🌾", false},
	{9, "Barilla spagetti", "Barilla", 20, 0, "500 gr", "sany", "🍝", false},
	{9, "Makaron Dostluk", "Dostluk", 5, 0, "400 gr", "sany", "🍝", false},
	{9, "Makaron spiral", "", 8, 0, "1 kg", "kg", "🍝", false},
	{9, "Anakom lapşa", "Anakom", 4, 0, "60 gr", "sany", "🍜", false},
	{9, "Big Bon towukly", "Big Bon", 15, 0, "95 gr", "sany", "🍜", true},
	{9, "Big Bon sygyr etli", "Big Bon", 8, 0, "75 gr", "sany", "🍜", false},
	{9, "Rollton", "Rollton", 3, 0, "60 gr", "sany", "🍜", false},
	{9, "Noýba ak", "", 15, 0, "1 kg", "kg", "🥣", false},
	{9, "Mäş", "", 12, 0, "1 kg", "kg", "🥣", false},
	{9, "Merjimek gyzyl", "", 18, 0, "1 kg", "kg", "🥣", false},
	{9, "Manka", "", 10, 0, "1 kg", "kg", "🌾", false},
	{9, "Owsýanka", "", 12, 0, "500 gr", "sany", "🥣", false},
	{9, "Duz", "", 2, 0, "1 kg", "kg", "🧂", false},
	{9, "Altyn gabartma tozy", "Altyn", 1, 0, "10 gr", "sany", "🧂", false},
	{9, "Sirke 9%", "", 5, 0, "500 ml", "sany", "🍶", false},
	{9, "Nohut", "", 14, 0, "1 kg", "kg", "🥣", false},

	// ---- Konserwler (10) ----
	{10, "Rita ananas", "Rita", 35, 0, "565 gr", "sany", "🍍", true},
	{10, "Rita mekgejöwen", "Rita", 23, 0, "340 gr", "sany", "🌽", false},
	{10, "Rita garoh", "Rita", 19, 0, "400 gr", "sany", "🥫", false},
	{10, "Rita noýba", "Rita", 18, 0, "400 gr", "sany", "🥫", false},
	{10, "Rýaba sykma maýonez 67%", "Rýaba", 13, 0, "1 sany", "sany", "🥫", true},
	{10, "Rýaba maýonez", "Rýaba", 20, 0, "400 gr", "sany", "🥫", false},
	{10, "Heinz ketçup", "Heinz", 25, 0, "350 gr", "sany", "🍅", false},
	{10, "Baltimor ketçup", "Baltimor", 12, 0, "260 gr", "sany", "🍅", false},
	{10, "Pomidor goýaltmasy", "", 15, 0, "500 gr", "sany", "🍅", false},
	{10, "Ogurçy marinad", "", 18, 0, "720 ml", "sany", "🥒", false},
	{10, "Şampinýon konserw", "", 22, 0, "400 gr", "sany", "🍄", false},
	{10, "Sardina ýagda", "", 15, 0, "240 gr", "sany", "🐟", false},
	{10, "Tunes konserw", "", 28, 0, "185 gr", "sany", "🐟", false},
	{10, "Zeýtun gara", "", 25, 0, "300 gr", "sany", "🫒", false},
	{10, "Gorçisa", "", 6, 0, "100 gr", "sany", "🥫", false},
	{10, "Soýa sousy", "", 12, 0, "150 ml", "sany", "🍶", false},
	{10, "Tuşonka sygyr eti", "", 35, 0, "325 gr", "sany", "🥫", false},

	// ---- Doňdurylan önümler (11) ----
	{11, "Pelmeni sygyr etli", "", 45, 0, "1 kg", "kg", "🥟", true},
	{11, "Manty", "", 50, 0, "1 kg", "kg", "🥟", false},
	{11, "Eskimo doňdurma", "", 5, 0, "1 sany", "sany", "🍦", false},
	{11, "Plombir doňdurma", "", 25, 0, "500 gr", "sany", "🍨", true},
	{11, "Doňdurylan gök önümler garyndy", "", 20, 0, "400 gr", "sany", "🥦", false},
	{11, "Doňdurylan ýaşyl noýba", "", 18, 0, "400 gr", "sany", "🥬", false},
	{11, "Towuk nagets", "", 30, 0, "500 gr", "sany", "🍗", false},
	{11, "Kotlet sygyr etli", "", 28, 0, "500 gr", "sany", "🍖", false},
	{11, "Doňdurylan pizza", "", 35, 0, "400 gr", "sany", "🍕", false},
	{11, "Çebureki", "", 30, 0, "10 sany", "sany", "🥟", false},

	// ---- Arassaçylyk we öý (12) ----
	{12, "Persil kir ýuwujy", "Persil", 95, 0, "3 kg", "sany", "🧺", true},
	{12, "Ariel kir ýuwujy", "Ariel", 90, 99, "3 kg", "sany", "🧺", false},
	{12, "Tide kir ýuwujy", "Tide", 75, 0, "3 kg", "sany", "🧺", false},
	{12, "Fairy gap ýuwujy", "Fairy", 20, 0, "450 ml", "sany", "🧽", false},
	{12, "Domestos", "Domestos", 25, 0, "1 L", "sany", "🧴", false},
	{12, "Comet", "Comet", 15, 0, "475 gr", "sany", "🧴", false},
	{12, "Hajathana kagyzy", "", 12, 0, "4 sany", "sany", "🧻", false},
	{12, "Salfetka", "", 5, 0, "100 sany", "sany", "🧻", false},
	{12, "Gap ýuwujy gubka", "", 6, 0, "5 sany", "sany", "🧽", false},
	{12, "Zibil haltasy", "", 8, 0, "30 sany", "sany", "🗑️", false},
	{12, "Colgate diş pastasy", "Colgate", 15, 0, "100 ml", "sany", "🪥", false},
	{12, "Diş çotgasy", "Colgate", 8, 0, "1 sany", "sany", "🪥", false},
	{12, "Head & Shoulders şampun", "Head & Shoulders", 45, 0, "400 ml", "sany", "🧴", true},
	{12, "Dove sabyn", "Dove", 8, 0, "100 gr", "sany", "🧼", false},
	{12, "Safeguard sabyn", "Safeguard", 6, 0, "90 gr", "sany", "🧼", false},
	{12, "Rexona dezodorant", "Rexona", 25, 0, "150 ml", "sany", "🧴", false},
	{12, "Gillette ýeke gezeklik", "Gillette", 20, 0, "2 sany", "sany", "🪒", false},
	{12, "Alýumin folga", "", 10, 0, "10 m", "sany", "🧻", false},
	{12, "Çyrtma", "", 3, 0, "10 guty", "sany", "🔥", false},

	// ---- Çaga önümleri (13) ----
	{13, "Pampers 4", "Pampers", 150, 165, "52 sany", "sany", "👶", true},
	{13, "Huggies 3", "Huggies", 140, 0, "58 sany", "sany", "👶", false},
	{13, "Nestle NAN 1 süýt garyndysy", "Nestle", 85, 0, "400 gr", "sany", "🍼", true},
	{13, "Nestle çaga şülesi", "Nestle", 30, 0, "250 gr", "sany", "🥣", false},
	{13, "Agusha püre alma", "Agusha", 6, 0, "90 gr", "sany", "🍎", false},
	{13, "FrutoNýanýa şire", "FrutoNýanýa", 5, 0, "200 ml", "sany", "🧃", false},
	{13, "Çaga çygly salfetka", "", 15, 0, "72 sany", "sany", "🧻", false},
	{13, "Johnson's çaga sabyny", "Johnson's", 10, 0, "100 gr", "sany", "🧼", false},
	{13, "Çaga şampuny", "Johnson's", 25, 0, "300 ml", "sany", "🧴", false},
	{13, "Emzik", "", 8, 0, "1 sany", "sany", "🍼", false},
}

var descTemplates = []string{
	"%s — %s bölüminiň iň köp satylýan harytlarynyň biri. Hili barlanan, täze we ygtybarly. Sargydyňyzy Aşgabat şäheri boýunça şol günüň özünde eltip berýäris.",
	"%s. %s bölüminden saýlanan önüm. Önümiň möhleti we saklanyş şertleri berk gözegçilikde. 200 manatdan ýokary sargytlara eltip bermek mugt.",
	"Ýokary hilli %s. %s kategoriýasyndaky bu haryt her gün täzelenýär. Amatly baha we çalt eltip bermek — AzykSowda kepilligi.",
	"%s — maşgalaňyz üçin amatly saýlaw. %s bölüminden. Sargyt beriň, 1-2 sagadyň içinde öýüňize çenli eltip bereris.",
}

// Run inserts the demo admin, a test customer, categories, products, sample
// orders and activity logs. It is idempotent: each block only runs when the
// corresponding table is empty.
func Run(db *gorm.DB, cfg *config.Config) {
	seedUsers(db, cfg)
	seedCatalog(db)
	seedOrders(db)
}

func seedUsers(db *gorm.DB, cfg *config.Config) {
	var count int64
	db.Model(&models.User{}).Count(&count)
	if count > 0 {
		return
	}
	adminHash, _ := utils.HashPassword(cfg.AdminPassword)
	testHash, _ := utils.HashPassword("test123")
	users := []models.User{
		{Name: "Administrator", Email: cfg.AdminEmail, Password: adminHash, Role: models.RoleAdmin, Phone: "+993 12 947635", Address: "Aşgabat, Azady köçesi 12", IsActive: true},
		{Name: "Merdan Annaýew", Email: "test@azyksowda.com", Password: testHash, Role: models.RoleUser, Phone: "+993 65 123456", Address: "Aşgabat, Parahat 2/1, 14-nji jaý, 25-nji öý", IsActive: true},
		{Name: "Maýsa Orazowa", Email: "maysa@example.com", Password: testHash, Role: models.RoleUser, Phone: "+993 62 334455", Address: "Aşgabat, Görogly köçesi 48, 7-nji öý", IsActive: true},
		{Name: "Döwlet Berdiýew", Email: "dowlet@example.com", Password: testHash, Role: models.RoleUser, Phone: "+993 61 778899", Address: "Aşgabat, Andalyp köçesi 15", IsActive: true},
	}
	for i := range users {
		users[i].CreatedAt = time.Now().AddDate(0, 0, -(30 - i*5))
		db.Create(&users[i])
	}
	db.Create(&models.ActivityLog{Action: "seed.users", Entity: "user", Level: "info", Message: fmt.Sprintf("%d ulanyjy döredildi (admin: %s)", len(users), cfg.AdminEmail), IP: "127.0.0.1"})
	log.Printf("[SEED] %d users created (admin: %s / %s)", len(users), cfg.AdminEmail, cfg.AdminPassword)
}

func seedCatalog(db *gorm.DB) {
	var count int64
	db.Model(&models.Category{}).Count(&count)
	if count > 0 {
		return
	}

	catIDs := make([]uint, len(categories))
	for i, c := range categories {
		cat := models.Category{
			Name: c.Name, Slug: utils.Slugify(c.Name), Emoji: c.Emoji, Color: c.Color,
			Description: c.Description, SortOrder: i + 1, IsActive: true,
		}
		db.Create(&cat)
		catIDs[i] = cat.ID
	}

	usedSlugs := map[string]int{}
	now := time.Now()
	created := 0
	for i, p := range products {
		slugBase := utils.Slugify(p.Name)
		if p.Weight != "" {
			slugBase = utils.Slugify(p.Name + " " + p.Weight)
		}
		slug := slugBase
		if n, ok := usedSlugs[slugBase]; ok {
			slug = fmt.Sprintf("%s-%d", slugBase, n+1)
			usedSlugs[slugBase] = n + 1
		} else {
			usedSlugs[slugBase] = 1
		}
		catName := categories[p.Cat].Name
		desc := fmt.Sprintf(descTemplates[i%len(descTemplates)], p.Name, catName)
		stock := 20 + (i*37)%180
		if i%23 == 11 {
			stock = 1 + (i*3)%9 // a few low-stock items for the admin dashboard
		}
		prod := models.Product{
			Name: p.Name, Slug: slug, Description: desc, Brand: p.Brand,
			Price: p.Price, OldPrice: p.OldPrice, Unit: p.Unit, Weight: p.Weight,
			Stock: stock, Sold: (i*53)%400 + 5, Emoji: p.Emoji, CategoryID: catIDs[p.Cat],
			IsFeatured: p.Featured, IsActive: true,
			CreatedAt: now.Add(-time.Duration(i) * 7 * time.Hour),
			UpdatedAt: now.Add(-time.Duration(i) * 7 * time.Hour),
		}
		if err := db.Create(&prod).Error; err != nil {
			log.Printf("[SEED] product %q failed: %v", p.Name, err)
			continue
		}
		created++
	}
	db.Create(&models.ActivityLog{Action: "seed.catalog", Entity: "product", Level: "info", Message: fmt.Sprintf("%d kategoriýa we %d haryt döredildi", len(categories), created), IP: "127.0.0.1"})
	log.Printf("[SEED] %d categories, %d products created", len(categories), created)
}

func seedOrders(db *gorm.DB) {
	var count int64
	db.Model(&models.Order{}).Count(&count)
	if count > 0 {
		return
	}
	var users []models.User
	db.Where("role = ?", models.RoleUser).Find(&users)
	var prods []models.Product
	db.Where("is_active = ?", true).Order("id ASC").Find(&prods)
	if len(users) == 0 || len(prods) < 10 {
		return
	}

	statuses := []string{models.OrderDelivered, models.OrderDelivered, models.OrderDelivering, models.OrderConfirmed, models.OrderPending, models.OrderPending, models.OrderCancelled, models.OrderDelivered}
	payments := []string{"cash", "card"}
	now := time.Now()
	total := 0
	for i := 0; i < 14; i++ {
		u := users[i%len(users)]
		n := 2 + i%4
		var items []models.OrderItem
		var subtotal float64
		cnt := 0
		for j := 0; j < n; j++ {
			p := prods[(i*17+j*31)%len(prods)]
			q := 1 + (i+j)%3
			line := utils.Round2(p.Price * float64(q))
			subtotal += line
			cnt += q
			items = append(items, models.OrderItem{
				ProductID: p.ID, Name: p.Name, Slug: p.Slug, Image: p.Image, Emoji: p.Emoji, Weight: p.Weight,
				Price: p.Price, Quantity: q, Total: line,
			})
		}
		subtotal = utils.Round2(subtotal)
		fee := 10.0
		if subtotal >= 200 {
			fee = 0
		}
		createdAt := now.Add(-time.Duration(i*11) * time.Hour)
		ord := models.Order{
			UserID: u.ID, Status: statuses[i%len(statuses)], Subtotal: subtotal, DeliveryFee: fee,
			Total: utils.Round2(subtotal + fee), ItemCount: cnt, Name: u.Name, Phone: u.Phone, Address: u.Address,
			PaymentMethod: payments[i%2], Items: items, CreatedAt: createdAt, UpdatedAt: createdAt,
		}
		if i%5 == 0 {
			ord.Note = "Gapyny kakmaň, jaň ediň"
		}
		if err := db.Create(&ord).Error; err != nil {
			continue
		}
		db.Model(&ord).Update("number", fmt.Sprintf("AZ%06d", ord.ID))
		uid := u.ID
		db.Create(&models.ActivityLog{UserID: &uid, UserEmail: u.Email, Action: "order.create", Entity: "order", EntityID: ord.ID, Level: "info",
			Message: fmt.Sprintf("Täze sargyt AZ%06d: %d haryt, jemi %.2f manat", ord.ID, cnt, ord.Total), IP: "127.0.0.1", CreatedAt: createdAt})
		total++
	}
	db.Create(&models.ActivityLog{Action: "seed.orders", Entity: "order", Level: "info", Message: fmt.Sprintf("%d nusga sargyt döredildi", total), IP: "127.0.0.1"})
	log.Printf("[SEED] %d sample orders created", total)
}
