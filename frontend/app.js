import { installNavigation } from './components/navigation.client.js';
import { installExplorer } from './components/explorer.client.js';
import { installMechanics } from './components/mechanics.client.js';
import { installGallery } from './components/gallery.client.js';
import { installEconomy } from './components/economy.client.js';
import { installLanguageSwitch } from './components/language.client.js';
installLanguageSwitch();
installNavigation();
installExplorer();
installMechanics();
installGallery();
installEconomy();

import { installPlaytest } from './components/playtest.client.js';
installPlaytest();
