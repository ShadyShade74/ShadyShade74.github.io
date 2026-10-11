# Ważne info:
-Podejście modułowe i klasowe
-Rozdzielanie kodu na osobne pliki i sortowanie ich w folderach
-Czysty JS i Canvas 2D

# Gracz:
-Klasa Gracza
-WSAD Poruszanie się
-Animacje chodzenia ze spritesheetu
-HP i pasek HP z unikalnym wyglądem aktualizujący się przy stracie lub zysku życia
-Bieganie pod shiftem 
-Stamina i Pasek Staminy aktualizujący się przy stracie lub zysku staminy .
-Interakcja ze światem za pomocą 'E'

# Mechaniki:
-System ekwipunku oraz wyposażenia np. zbroja , broń
-Alchemia
-Wytwarzanie
-System walki
-Handel
-System xpa i leveli
-Drzewko umiejętności/talentów
-Zadania i system zaliczania ,zdobywania questów ,nagród w postaci xp
-Cykl dnia i nocy

# UI:
-Menu Inventory
-Quest Tab
-Mapa Świata 
-UI /Okno handlu 
-UI np. skrzyń , sakw , schowków etc.
-UI pokazujący zawartość np. listów , książek podczas czytania
-Alchemia / Tworzenie Misktur
-Rzemiosło / Tworzenie broni , zbroi

# Walka:
-2 Rodzaje Ataków:
* Slash
* Thrust
-2 Formy Ataków:
* Light
* Heavy
-Atakuje się za pomocą LPM 
-Mechanika bloku/paru jest pod PPM:
* Jeśli się trafi w okno czasowe podczas blokowania ataku to wykonuje się par ,który odbija atak i neguje 100% dmg
* Poza tym oknem przy przytrzymaniu PPM wykonywany jest blok ,który neguje 40% dmg
-Zmiana chwytu decyduje o formie ataku ,pod Ctrl zmienia się chwyt (1H/2H):
* 1H -Jędnoręczny light atak 
* 2H- Dwuręczny heavy attack
-Light Attack :
* ma opcje robienia combo jeśli się trafi atak za atakiem w małych odstępach co powoduje lekki knockback po ataku oraz bonus % do dmg i możliwość zadania obrażeń krytycznych .
* Nie zużywa
-Heavy attack 
* ma wiekszy cooldown oraz wiekszy dmg od light attacku 
* zużywa staminę 
* Ma % szans na atak krytyczny przy bazowym ataku
* Ma % szans na powalenie przeciwnika 
-Atak krytyczny zadaje dodatkowe obrażenia + ma % szansy na nałożenie efektu krwawienia ,który zabiera część życia na przestrzeni czasu oraz blokuje naturalną regenerację
-Przeciwnik z efektem powalenia ,które trwa kilka sekund traktuje każdy atak jako krytyczny
-Regenerować można się:
* Poza walką naturalnie się regenerować
* Za pomocą jedzenia
* Za pomocą mikstur lub innego sposobu nabyć efekt regeneracji
* Śpiąc / Medytując - od razu po skończeniu czynności 
-Dmg jest liczony bazując na bazowym ataku atakującego , jego poziomie ,jego uzbrojeniu oraz uzbrojeniu atakowanego , obliczany jest przez specjalny wzór
-Do dmg wliczane są również różne buffy z drzewka talentów , mikstur i ogl buffów


# Teren i Architektura Świata:
-Chunking i Frustum Culling: Podział mapy na niezależne bloki (np. 1024x1024 px) i renderowanie tylko tych w kadrze kamery.

-Baking podłoża (OffscreenCanvas): Jednorazowe wygenerowanie tła chunku do pamięci RAM przy jego ładowaniu, bez przerysowywania co klatkę.

-Heightmapa (Z) i projekcja 2.5D 3/4 Top Down: Przypisanie wysokości Z do pozycji (X, Y) i przeliczanie punktu rysowania ze wzoru screenY = worldY - heightZ.

-Płynne zbocza: Mechanika sprawdzająca nachylenie terenu – łagodne pozwala na wchodzenie pod górę, zbyt strome tworzy klif lub ścianę.
-Organiczne przejścia i biomy: Wykorzystanie masek przezroczystości oraz szumu Perlina do generowania postrzępionych ścieżek i miękkich krawędzi.

-Dynamiczna woda i wodospady: Wycinanie przezroczystych obszarów w chunku podłoża z podłożoną pod spód scrollowaną teksturą wody oraz cząsteczkami piany.

-Kolizje wektorowe: Wykorzystanie wielokątów dla przeszkód otoczenia i koła dla postaci (Circle vs Polygon) do płynnego ślizgania się po krawędziach.

-Sortowanie głębi (Y-Sorting): Sortowanie obiektów przed narysowaniem klatki na podstawie ich pozycji na ekranie (zIndex = worldY) dla poprawnej perspektywy zasłaniania.

-Abstrakcja Renderera: Wyizolowanie modułu rysującego, ułatwiające przyszłą migrację z natywnego Canvas 2D na WebGL.

-Obiekty z własną teksturą i collison boxami 
