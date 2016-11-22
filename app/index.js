var generators = require('yeoman-generator');
var fs = require('fs');

var promptMySQLHost = function(self) {
    if (!self.options.mysqlHost) {
        return self.prompt([{
                type: 'input',
                name: 'mysqlHost',
                message: 'MySQL Hostname',
                default: 'localhost',
                store: true
            }
        ]).then(function(answers) {
            self.options.mysqlHost = answers.mysqlHost;
            //this.log('base package', answers.pkg);
        }.bind(self));
    }
};
var promptMySQLUser = function(self) {
    if (!self.options.mysqlUser) {
    
        self.log("This generator needs to execute some SQL commands that require MySQL root permissions.  This may include things like creating a database for the app, creating a MySQL user for the app to access the database or granting permissions to a MySQL user for the app to access the database. \n"
            + " This username will not be used by the app itself and will not be stored anywhere.  It is just for the purpose of setting up the app initially.\n"
        ); 
        return self.prompt([{
            type: 'input',
            name: 'mysqlUser',
            message: 'Root MySQL Username',
            default: 'root',
            store: true
        }]).then(function(answers) {
            self.options.mysqlUser = answers.mysqlUser;
            //this.log('base package', answers.pkg);
        }.bind(self));
    }
};
var promptMySQLPassword = function(self) {
    // let's actually not request the password... the user will be asked at the command prompt
    self.options.mysqlPassword = '';
    return;
    if (!self.options.mysqlPassword) {
        return self.prompt([{
            type: 'password',
            name: 'mysqlPassword',
            message: 'Root MySQL Password'
        }]).then(function(answers) {
            self.options.mysqlPassword = answers.mysqlPassword;
            //this.log('base package', answers.pkg);
        }.bind(self));
    }
};

module.exports = generators.Base.extend({
  // The name `constructor` is important here
  constructor: function () {
    // Calling the super constructor is important so our generator is correctly set up
    generators.Base.apply(this, arguments);

    // Next, add your custom code
    this.argument('appname', {type: String, required: true, desc: "Used for the app directory name, and default database name"});
    this.argument('installFile', {type: String, required: false, desc: "Path to SQL file containing commands to execute upon creating the database" });
    this.option('mysqlHost', {desc: "Hostname of MySQL server"});
    this.option('mysqlUser', {desc: "MySQL user to create database.  Usually root.  Only used by this generator.  Not the app."});
    this.option('mysqlPassword', {desc: "MySQL password to create database. Only used by this generator.  Not the app."});
    this.option('dbName', {desc: "Database name for app."});
    this.option('dbUser', {desc: "Database username.  This is the user that the app will connect as."});
    this.option('dbPassword', {desc: "Database password.  This is the password for the app to connect to the database."});
    this.option('tables', {desc:"Tables to include in menu.  Format: table1=Label1,table2=Label2, etc..."});
    this.option('usersTable', {desc: "Name of table that stores the app's users if using table-based authentication."});
    this.option('passwordColumn', {desc: "The column of the users table that stores the password."});
    this.option('passwordEncryption', {desc: "The encryption type to use for the password column in table-based authentication.  sha1, md5, encrypt, or password"});
    this.option('usernameColumn', {desc: "The column of the users table that stores the username."});
    this.option('emailColumn', {desc: "The column of the users table that stores the email address."});
    this.option('roleColumn', {desc: "The column of the users table that stores the role"});
    this.option('mysqli', {desc: "Disable mysqli with --mysql=n"});
    this.option('mysql', {desc: "Absolute path to the mysql CLI executable.  This isn't necessary if mysql is in your environment's PATH."});
    this.option('git', {desc: "Absolute path to the git CLI executable.  This isn't necessary if git is in your environment's PATH."});
    this.option('createDatabase', {desc: "y=Create the database.  Only set this to 'y' if the database doesn't yet exist."});
    this.option('createUser', {desc: "y=Create the app's mysql user. Only set this to 'y' if the database user doesn't yet exist."});
    this.option('createUsersTable', {desc: "y=Create the users table in the database automatically.  Only for table-based authenticaton.  Only set this to 'y' if the users table doesn't yet exist."});
    this.option('createAdminUser', {desc: "y=Insert an admin user for the app into the users table."});
    
    
  },
  
    checkRootDir: function() {
        if (fs.existsSync(this.destinationPath(this.appname))) {
            throw new Error("The target path "+this.appname+" already exists.  This generator is only for generating new Xataface apps.  Please choose an app name that doesn't yet exist.");
        }
        if (this.installFile && !fs.existsSync(this.destinationPath(this.installFile))) {
            throw new Error("The specified installfile "+this.installFile+" does not exist");
        }
        //fs.mkdirSync(this.destinationPath(this.appname), 0o755);
      },
  
    promptMySQLHost0 : function() {
      return promptMySQLHost(this);
    },
  
    promptDbName: function() {
    if (!this.options.dbName) {
        this.log("The following series of prompts will set up the database connection information that is used by the app.  This includes the "
            + "host name, database name, database user (for the app to connect to the database), and database password.\n\n"
            + "This information will be stored in the app's conf.db.ini file and may be edited later on by you if you need to change it.\n");
    
        return this.prompt([{
            type: 'input',
            name: 'dbName',
            message: 'App Database Name',
            default: this.appname,
            validate: function (input) {
                var done = this.async();
                if (input.match(/[^a-zA-Z_0-9]/)) {
                    done(false, "Please use only alpha-numerics and underscores in database name");
                }
                done(null, true);
            }
        }]).then(function(answers) {
            this.options.dbName = answers.dbName;
            //this.log('base package', answers.pkg);
        }.bind(this));
    }
    },
    promptDbUser: function() {
    if (!this.options.dbUser) {
        return this.prompt([{
            type: 'input',
            name: 'dbUser',
            message: 'App Database Username',
            default: this.options.dbName.length > 16 ? this.options.dbName.substring(0,16) : this.options.dbName,
            validate: function(input) {
                var done = this.async();
                if (input.length > 16) {
                    done(false, "MySQL usernames can be max 16 characters");
                }
                done(null, true);
            }
        }]).then(function(answers) {
            this.options.dbUser = answers.dbUser;
            //this.log('base package', answers.pkg);
        }.bind(this));
    }
    },
    promptDbPassword: function(){
    if (!this.options.dbPassword) {
        return this.prompt([{
            type: 'password',
            name: 'dbPassword',
            message: 'App Database Password'
        }]).then(function(answers) {
            this.options.dbPassword = answers.dbPassword;
            //this.log('base package', answers.pkg);
        }.bind(this));
    }
    //}
    
    
  },
  
  promptTables : function() {
    if (!this.options.tables) {
    
        this.log("Xataface applications include a 'main' menu to allow the user to select the table that they wish to work with.  You *must* include at least one "
            + "table in this menu, but you probably don't want to include all of your tables (e.g. join tables).  Only include the tables that you consider 'top-level'.\n\n"
            + "Note:  If a table is not included in this menu it can still be accessed by the user either by entering the appropriate URL directly, or by way of relationships.\n"
            + "If you wish to block access to a table, you should either use permissions, or the [_disallowed_tables] section of your conf.ini file.\n");
    
        return this.prompt([{
            type: 'input',
            name: 'tables',
            message: 'List the tables that should be included in the main menu in the form: table1=Label1,table2=Label2, etc...',
            validate: function (input) {
                var done = this.async();
                if (!input.match(/[a-zA-Z]/)) {
                    done(false, "You should enter at least one table");
                }
                done(null, true);
            }
        }]).then(function(answers) {
            this.options.tables = answers.tables;
            //this.log('base package', answers.pkg);
        }.bind(this));
    }
  },
  
  promptUseDefaultAuthSettings : function () {
        //if (this.options.setupUsersTable == 'y') {
        
            var defaultUsersTable = this.options.usersTable || 'users';
            var defaultUsernameColumn = this.options.usernameColumn || 'username';
            var defaultPasswordColumn = this.options.passwordColumn || 'password';
            var defaultRoleColumn = this.options.roleColumn || 'role';
            var defaultEmailColumn = this.options.emailColumn || 'email';
            var defaultPasswordEncryption = this.options.passwordEncryption || 'sha1';
            var defaultUserPermissions = this.options.userPermissions || 'READ ONLY';
            var defaultPublicPermissions = this.options.publicPermissions || 'NO ACCESS';
            
            this.log("Default settings authentication are as follows:\n"
                + "Table-based authentication with Users table definition: \n" 
                +  "create table if not exists `" + defaultUsersTable + "` (\n"
                + "    `"+defaultUsernameColumn+"` VARCHAR(100) NOT NULL PRIMARY KEY,\n"
                + "    `"+defaultPasswordColumn+"` VARCHAR(64) NOT NULL,\n"
                + "    `"+defaultRoleColumn+"` ENUM('USER','ADMIN') DEFAULT 'USER',\n"
                + "    `"+defaultEmailColumn+"` VARCHAR(255) NOT NULL,\n"
                + "    UNIQUE KEY (`"+defaultEmailColumn+"`));\n\n"
                + " With "+defaultPasswordEncryption+" encryption on the password field.\r\n"
                + "ADMIN users are granted ALL permissions, logged in users are granted "+defaultUserPermissions+" permissions, and the public (i.e. not logged-in users) are granted "+defaultPublicPermissions+".\n");
                
            return this.prompt([{
                type: 'confirm',
                name: 'useDefaultAuthSettings',
                message: 'Would you like to use these default authentication settings?',
                default: 'users'
            }]).then(function(answers) {
                if (answers.useDefaultAuthSettings) {
                    this.options.usersTable = 'users';
                    this.options.usernameColumn = 'username';
                    this.options.passwordColumn = 'password';
                    this.options.roleColumn = 'role';
                    this.options.emailColumn = 'email';
                    this.options.passwordEncryption = 'sha1';
                    this.options.userPermissions = defaultUserPermissions;
                    this.options.publicPermissions = defaultPublicPermissions;
                }
                //this.options.usersTable = answers.usersTable;
                //this.log('base package', answers.pkg);
            }.bind(this));
        //}
  },
  
  promptSetupUsersTable : function() {
    if (!this.options.usersTable) {
        return this.prompt([{
            type: 'confirm',
            name: 'setupUsersTable',
            message: 'Use table-based authentication?',
            default: true
        }]).then(function(answers) {
            this.options.setupUsersTable = answers.setupUsersTable;

        }.bind(this));
    }
  },
  
  
  
  promptUsersTable : function() {
    if (this.options.setupUsersTable && !this.options.usersTable) {
        return this.prompt([{
            type: 'input',
            name: 'usersTable',
            message: 'Users table name',
            default: 'users'
        }]).then(function(answers) {
            this.options.usersTable = answers.usersTable;
            //this.log('base package', answers.pkg);
        }.bind(this));
    }
    },
  promptUsernameColumn : function() {
    if (this.options.setupUsersTable && !this.options.usernameColumn) {
        return this.prompt([{
            type: 'input',
            name: 'usernameColumn',
            message: 'Username column',
            default: 'username'
        }]).then(function(answers) {
            this.options.usernameColumn = answers.usernameColumn;
            //this.log('base package', answers.pkg);
        }.bind(this));
    }
    },
    
    promptPasswordColumn: function() {
    if (this.options.setupUsersTable && !this.options.passwordColumn) {
        return this.prompt([{
            type: 'input',
            name: 'passwordColumn',
            message: 'Password column',
            default: 'password'
        }]).then(function(answers) {
            this.options.passwordColumn = answers.passwordColumn;
            //this.log('base package', answers.pkg);
        }.bind(this));
    }
    },
    
    promptPasswordEncryption : function() {
    if (this.options.setupUsersTable && !this.options.passwordEncryption) {
        return this.prompt([{
            type: 'list',
            choices: ['sha1','md5','encrypt','password','none'],
            name: 'passwordEncryption',
            message: 'Password Encryption',
            default: 'sha1'
        }]).then(function(answers) {
            this.options.passwordEncryption = answers.passwordEncryption;
            //this.log('base package', answers.pkg);
        }.bind(this));
    }
    },
    
    promptEmailColumn : function() {
    
    if (this.options.setupUsersTable && !this.options.emailColumn) {
        return this.prompt([{
            type: 'input',
            name: 'emailColumn',
            message: 'Email column',
            default: 'email'
        }]).then(function(answers) {
            this.options.emailColumn = answers.emailColumn;
            //this.log('base package', answers.pkg);
        }.bind(this));
    }
    },
    
    
    promptRoleColumn : function() {
    if (this.options.setupUsersTable && !this.options.roleColumn) {
        return this.prompt([{
            type: 'input',
            name: 'roleColumn',
            message: 'Role column',
            default: 'role'
        }]).then(function(answers) {
            this.options.roleColumn = answers.roleColumn;
            //this.log('base package', answers.pkg);
        }.bind(this));
    }
    },
    
    promptUserPermissions: function() {
    if (this.options.setupUsersTable && !this.options.userPermissions) {
        return this.prompt([{
            type: 'list',
            choices: ['ALL', 'READ ONLY'],
            name: 'userPermissions',
            message: 'User permissions (when logged)',
            default: 'READ ONLY'
        }]).then(function(answers) {
            this.options.userPermissions = answers.userPermissions;
            //this.log('base package', answers.pkg);
        }.bind(this));
    }
    
    
    
    
  },
  
  promptPublicPermissions: function() {
    if (this.options.setupUsersTable && !this.options.publicPermissions) {
        return this.prompt([{
            type: 'list',
            choices: ['NO ACCESS', 'READ ONLY'],
            name: 'userPermissions',
            message: 'Public permissions (access when not logged in)',
            default: 'NO ACCESS'
        }]).then(function(answers) {
            this.options.userPermissions = answers.userPermissions;
            //this.log('base package', answers.pkg);
        }.bind(this));
    }
    
    
    
    
  },
  
  mkRootDir: function() {
    if (fs.existsSync(this.destinationPath(this.appname))) {
        throw new Error("The target path "+this.appname+" already exists.  This generator is only for generating new Xataface apps.  Please choose an app name that doesn't yet exist.");
    }
    fs.mkdirSync(this.destinationPath(this.appname), 0o755);
  },
  
  
  
  
  
  gitClone: function() {
    this.log("Cloning xataface into", this.destinationPath(this.appname));
    this.spawnCommandSync('git', ['clone', 'https://github.com/shannah/xataface', this.destinationPath(this.appname + '/xataface')]);
  
  },
  
  mkTemplatesC : function() {
    fs.mkdirSync(this.destinationPath(this.appname + '/templates_c'), '0777');
    fs.chmodSync(this.destinationPath(this.appname + '/templates_c'), '0777');
    fs.mkdirSync(this.destinationPath(this.appname) + '/conf', 0o755);
    fs.mkdirSync(this.destinationPath(this.appname) + '/tables', 0o755);
    fs.mkdirSync(this.destinationPath(this.appname) + '/actions', 0o755);
    
  },
  
  copyRootHtAccess: function() {
    var done = this.async();
    this.log("Copying .htaccess file");
    var propertiesSamplePath = this.destinationPath(this.appname + '/xataface/site_skeleton/.htaccess');
    var propertiesPath = this.destinationPath(this.appname + '/.htaccess');
    this.propertiesPath = propertiesPath;
    var source = fs.createReadStream(propertiesSamplePath);
    var dest = fs.createWriteStream(propertiesPath);

    source.pipe(dest);
    source.on('end', function() {
        
        done();
    });
    source.on('error', function(err) { this.log("Failed to copy .htaccess"); });
    
  },
  
  copyTemplatesCHtAccess: function() {
    var done = this.async();
    this.log("Copying .htaccess file to templates_c");
    var propertiesSamplePath = this.destinationPath(this.appname + '/xataface/.htaccess');
    var propertiesPath = this.destinationPath(this.appname + '/templates_c/.htaccess');
    this.propertiesPath = propertiesPath;
    var source = fs.createReadStream(propertiesSamplePath);
    var dest = fs.createWriteStream(propertiesPath);

    source.pipe(dest);
    source.on('end', function() {
        
        done();
    });
    source.on('error', function(err) { this.log("Failed to copy .htaccess"); });
    
  },
  
  writeFunctionsIncFile : function() {
    var contents = "<?php\r\nfunction getUser(){\r\n"
	    + "    static $user =-1;\r\n"
	    + "    if (is_int($user) and $user == -1 ){\r\n"
		+ "        $user = Dataface_AuthenticationTool::getInstance()->getLoggedInUser();\r\n"
		+ "    }\r\n"
		+ "    return $user;\r\n"
		+ "}\r\n";
	
	
	contents += "function getRole(){\r\n"
	    + "    static $role = -1;\r\n"
	    + "    if ( is_int($role) and $role == -1 ){\r\n"
		+ "        $user = getUser();\r\n"
		+ "        if ( !$user ) return null;\r\n"
		+ "        $role = $user->val('"+this.options.roleColumn+"');\r\n"
		+ "    }\r\n"
		+ "    return $role;\r\n"
	    + "}\r\n";
	    
	contents += "function isAdmin(){\r\n"
	    + "    return (getRole() == 'ADMIN');\r\n"
        + "}\r\n";
        
    fs.mkdirSync(this.destinationPath(this.appname + '/includes'), 0o755);
    fs.appendFileSync(this.destinationPath(this.appname + '/includes/functions.inc.php'), contents);

  },
  
  writeIndexFile : function() {
  
    var contents = "<?php\r\nrequire_once 'xataface/public-api.php';\r\n"
        + "require_once 'includes/functions.inc.php';\r\n"
        + "df_init(__FILE__, 'xataface')->display();";
    fs.appendFileSync(this.destinationPath(this.appname + '/index.php'), contents);
  },
  
  writeConfFile : function() {
    var contents = "__include__=conf.db.ini\r\n[_tables]\r\n";
    
    var tables = this.options.tables.split(/,/);
    tables.forEach(function(value) {
        var kv = value.split(/=/);
        var tablename = kv[0];
        var label = tablename;
        if (kv.length > 1) {
            label = kv[1];
        }
        contents += "    " + tablename+'='+label+"\r\n";
    });
    
    if (this.options.usersTable) {
        contents += "\r\n[_auth]\r\n";
        contents += "    users_table=" + this.options.usersTable + "\r\n";
        contents += "    username_column=" + this.options.usernameColumn + "\r\n";
        contents += "    password_column=" + this.options.passwordColumn + "\r\n";
        contents += "    email_column=" + this.options.emailColumn + "\r\n";
    }
    
    fs.appendFileSync(this.destinationPath(this.appname + "/conf.ini"), contents);
    
  },
  
  writeConfDbFile : function() {
  
    var driver = 'mysqli';
    if (this.options.mysqli == 'n') {
        driver = '';
    }
    var contents = "[_database]\r\n"
        + "    name="+this.options.dbName+"\r\n"
        + "    host="+this.options.mysqlHost+"\r\n"
        + "    user="+this.options.dbUser+"\r\n"
        + "    password="+this.options.dbPassword+"\r\n"
        + (driver ? ("    driver="+driver+"\r\n") : "")
        ;
    fs.appendFileSync(this.destinationPath(this.appname + "/conf.db.ini"), contents);
    
  },
  
  
  makeUsersDir : function() {
    if (this.options.usersTable) {
        fs.mkdirSync(this.destinationPath(this.appname + "/tables/"+this.options.usersTable), 0o755);
        
        var contents = "["+this.options.passwordColumn+"]\r\n"
            + "    encryption=" + this.options.passwordEncryption;
        fs.appendFileSync(this.destinationPath(this.appname + "/tables/"+this.options.usersTable+"/fields.ini"), contents);
        
        
        contents = "<?php\r\nclass tables_"+this.options.usersTable+" {\r\n"
            + "    function getPermissions(Dataface_Record $record = null) {\r\n" 
            + "        if (isAdmin()) return null;\r\n"
            + "        if ($record and getUser() and $record->val('"+this.options.usernameColumn+"') === getUser()->val('"+this.options.usernameColumn+"')) {\r\n"
            + "            return Dataface_PermissionsTool::ALL();\r\n"
            + "        }\r\n"
            + "        return Dataface_PermissionsTool::NO_ACCESS();\r\n"
            + "    }\r\n\r\n"
            + "    function " + this.options.roleColumn + "__permissions(Dataface_Record $record = null) {\r\n"
            + "        if (isAdmin()) return null;\r\n"
            + "        if ($record and getUser() and $record->val('"+this.options.usernameColumn+"') === getUser()->val('"+this.options.usernameColumn+"')) {\r\n"
            + "            return Dataface_PermissionsTool::READ_ONLY();\r\n"
            + "        }\r\n"
            + "        return Dataface_PermissionsTool::NO_ACCESS();\r\n"
            + "    }\r\n\r\n"  
            + "}";
            
        fs.appendFileSync(this.destinationPath(this.appname + "/tables/"+this.options.usersTable+"/"+this.options.usersTable+".php"), contents);
    }        
    
  },
  
  
  makeAppDelegate : function() {
    
    var userPermissions = 'Dataface_PermissionsTool::READ_ONLY()';
    if (this.options.userPermissions == 'ALL') {
        userPermissions = 'Dataface_PermissionsTool::ALL()';
    }
    
    var publicPermissions = 'Dataface_PermissionsTool::NO_ACCESS()';
    if (this.options.publicPermissions == 'READ ONLY') {
        publicPermissions = 'Dataface_Permissions::READ_ONLY()';
    }
  
    var contents = "<?php\r\n"
        + "class conf_ApplicationDelegate {\r\n"
        + "    function getPermissions($record) {\r\n"
        + "        if (isAdmin()) {\r\n"
        + "            return Dataface_PermissionsTool::ALL();\r\n"
        + "        } else if (getUser()) {\r\n"
        + "            return " + userPermissions +";\r\n"
        + "        } else {\r\n" 
        + "            return " + publicPermissions + ";\r\n"
        + "        }\r\n"
        + "    }\r\n"
        + "}";
        
    fs.appendFileSync(this.destinationPath(this.appname + "/conf/ApplicationDelegate.php"), contents);
    
    
  },
  
  makeActionsIni : function () {
    if (this.options.usersTable) {
        var contents = "[manage_users]\r\n"
            + "    category=personal_tools\r\n"
            + "    url=\"{$site_href}?-table="+this.options.usersTable+"\"\r\n"
            + "    condition=\"isAdmin()\"\r\n"
            + "    label=\"Manage Users\"";
            
        fs.appendFileSync(this.destinationPath(this.appname + "/actions.ini"), contents);
    }
  },
  
  
  promptCreateDatabase : function() {
    if (!this.options.createDatabase) {
        return this.prompt([{
                type: 'confirm',
                name: 'createDatabase',
                message: 'Create the database ' + this.options.dbName+' now?',
                default: false
            }
        ]).then(function(answers) {
            this.options.createDatabase = answers.createDatabase;
            //this.log('base package', answers.pkg);
        }.bind(this));
    }
  },
  
  
  promptMySQLHost : function() {
    if (this.options.createDatabase) {
        return promptMySQLHost(this);
    }
  },
  
  promptMySQLUser : function() {
    if (this.options.createDatabase) {
        return promptMySQLUser(this);
    }
  },
  
  promptMySQLPassword : function() {
    if (this.options.createDatabase) {
        return promptMySQLPassword(this);
    }
  },
  createDatabaseSql : function() {
    if (this.options.createDatabase) {
        var mysqlPath = this.options.mysql || 'mysql';
        this.options.rootInstallSql = this.options.rootInstallSql || '';
        var cmd = 'create database if not exists '+ this.options.dbName + ';';
        this.options.rootInstallSql += cmd;
        
        //while (!this.spawnCommandSync(mysqlPath, ['-u', this.options.mysqlUser, '-h', this.options.mysqlHost, '-p' + this.options.mysqlPassword, '-e', 'create database '+ this.options.dbName])) {
        //    this.log('Failed.  Try again');
        //}
    }
  },
  
  promptCreateUser : function() {
    if (!this.options.createUser) {
        return this.prompt([{
                type: 'confirm',
                name: 'createUser',
                message: 'Create the user ' + this.options.dbUser+' now?',
                default: true
            }
        ]).then(function(answers) {
            this.options.createUser = answers.createUser;
            this.options.grantPermissions = 'y';
            
        }.bind(this));
    }
  },
  
  promptGrantPermissions : function() {
    if (this.options.createUser) {
        return this.prompt([{
                type: 'confirm',
                name: 'grantPermissions',
                message: 'Grant permissions to ' + this.options.dbUser+' now?',
                default: true
            }
        ]).then(function(answers) {
            this.options.grantPermissions = answers.grantPermissions;
            
        }.bind(this));
    }
  },
  
  promptMySQLHost2 : function() {
    if (this.options.createUser|| this.options.grantPermissions) {
        return promptMySQLHost(this);
    }
  },
  
  promptMySQLUser2 : function() {
    if (this.options.createUser || this.options.grantPermissions) {
        return promptMySQLUser(this);
    }
  },
  
  promptMySQLPassword2 : function() {
    if (this.options.createUser || this.options.grantPermissions) {
        return promptMySQLPassword(this);
    }
  },
  
  createUserSql : function() {
    if (this.options.createUser) {
        this.options.rootInstallSql = this.options.rootInstallSql || '';
        var userHost = 'localhost';
        if (this.options.mysqlHost !== 'localhost') {
            userHost = '%';
        }
        var mysqlPath = this.options.mysql || 'mysql';
        //this.spawnCommandSync(mysqlPath, ['-u', this.options.mysqlUser, '-h', this.options.mysqlHost, '-p', '<', '"create database if not exists '+ this.options.dbName +'"']);
        var cmd = "CREATE USER '"+this.options.dbUser+"'@'"+userHost+"' IDENTIFIED BY '"+this.options.dbPassword+"';";
        //this.log("Executing " + cmd);
        //while (!this.spawnCommandSync(mysqlPath, ['-u', this.options.mysqlUser, '-h', this.options.mysqlHost, '-p' + this.options.mysqlPassword, '-e', cmd])) {
        //    log('Failed.  Try again');
        //}
        
        //cmd += "GRANT ALL PRIVILEGES ON `" + this.options.dbName + "`.* to '"+this.options.dbUser+"'@'"+userHost+"'; FLUSH PRIVILEGES;";
        //this.log("Executing "+cmd);
        //while (!this.spawnCommandSync(mysqlPath, ['-u', this.options.mysqlUser, '-h', this.options.mysqlHost, '-p' + this.options.mysqlPassword, '-e', cmd])) {
        //    log('Failed.  Try again');
        //}
        
        this.options.rootInstallSql += cmd;
    }
  },
  
  grantPermissionsSql : function() {
      if (this.options.grantPermissions) {
        this.options.rootInstallSql = this.options.rootInstallSql || '';
        var userHost = 'localhost';
        if (this.options.mysqlHost !== 'localhost') {
            userHost = '%';
        }
        var mysqlPath = this.options.mysql || 'mysql';
        //this.spawnCommandSync(mysqlPath, ['-u', this.options.mysqlUser, '-h', this.options.mysqlHost, '-p', '<', '"create database if not exists '+ this.options.dbName +'"']);
        //var cmd = "CREATE USER '"+this.options.dbUser+"'@'"+userHost+"' IDENTIFIED BY '"+this.options.dbPassword+"';";
        //this.log("Executing " + cmd);
        //while (!this.spawnCommandSync(mysqlPath, ['-u', this.options.mysqlUser, '-h', this.options.mysqlHost, '-p' + this.options.mysqlPassword, '-e', cmd])) {
        //    log('Failed.  Try again');
        //}
        
        var cmd = "GRANT ALL PRIVILEGES ON `" + this.options.dbName + "`.* to '"+this.options.dbUser+"'@'"+userHost+"'; FLUSH PRIVILEGES;";
        //this.log("Executing "+cmd);
        //while (!this.spawnCommandSync(mysqlPath, ['-u', this.options.mysqlUser, '-h', this.options.mysqlHost, '-p' + this.options.mysqlPassword, '-e', cmd])) {
        //    log('Failed.  Try again');
        //}
        
        this.options.rootInstallSql += cmd;
    }
  },
  
  
  promptCreateUsersTable : function() {
    if (!this.options.createUsersTable && this.options.usersTable) {
        return this.prompt([{
                type: 'confirm',
                name: 'createUsersTable',
                message: 'Create the table ' + this.options.usersTable+' now?',
                default: true
            }
        ]).then(function(answers) {
            this.options.createUsersTable = answers.createUsersTable;
        }.bind(this));
    }
  },
  
  createUsersTableSql : function() {
    if (this.options.createUsersTable) {
        //this.options.createUsersTable = answers.createUsersTable;
        this.options.installSql = this.optionsInstallSql || '';
        
        var cmd = "create table if not exists `" + this.options.usersTable + "` ("
            + "    `" + this.options.usernameColumn + "` VARCHAR(100) NOT NULL PRIMARY KEY,"
            + "    `" + this.options.passwordColumn + "` VARCHAR(64) NOT NULL,\r\n"
            + "    `" + this.options.roleColumn + "` ENUM('USER','ADMIN') DEFAULT 'USER',"
            + "    `" + this.options.emailColumn + "` VARCHAR(255) NOT NULL,"
            + "    UNIQUE KEY (`" + this.options.emailColumn +"`));";
            
        this.options.installSql += cmd;
    }
  },
  
  promptCreateAdminUser : function() {
    if (!this.options.createAdminUser && this.options.createUsersTable) {
        this.log("In order to log into your application, you will need to have at least one user account in your users table.  If you don't "
            + " yet have any records inserted into the users table, you should add one now.\n");
        return this.prompt([{
                type: 'confirm',
                name: 'createAdminUser',
                message: 'Insert Admin user in users table?',
                default: true
            }
        ]).then(function(answers) {
            this.options.createAdminUser = answers.createAdminUser;
            //this.log('base package', answers.pkg);
        }.bind(this));
    }
  },
  
  promptAdminUser : function() {
    if (this.options.createAdminUser) {
        return this.prompt([{
                type: 'input',
                name: 'adminUser',
                message: 'Admin username',
                default: 'admin'
            }
        ]).then(function(answers) {
            this.options.adminUser = answers.adminUser;
            //this.log('base package', answers.pkg);
        }.bind(this));
    }
  },
  
  promptAdminPassword : function() {
    if (this.options.createAdminUser) {
        return this.prompt([{
                type: 'password',
                name: 'adminPassword',
                message: 'Admin password',
                default: 'password'
            }
        ]).then(function(answers) {
            this.options.adminPassword = answers.adminPassword;
            //this.log('base package', answers.pkg);
        }.bind(this));
    }
  },
  
  promptAdminEmail : function() {
    if (this.options.createAdminUser) {
        return this.prompt([{
                type: 'input',
                name: 'adminEmail',
                message: 'Admin Email Address'
            }
        ]).then(function(answers) {
            this.options.adminEmail = answers.adminEmail;
            //this.log('base package', answers.pkg);
        }.bind(this));
    }
  },
  createAdminUserSql : function() {
    if (this.options.createAdminUser) {
        //var mysqlPath = this.options.mysql || 'mysql';
        this.options.installSql = this.options.installSql || '';
        var cmd = "INSERT INTO `" + this.options.usersTable + "` ("
            + "`" + this.options.usernameColumn + "`,"
            + "`" + this.options.passwordColumn + "`,"
            + "`" + this.options.roleColumn + "`,"
            + "`" + this.options.emailColumn + "`) VALUES ("
            + "'" + this.options.adminUser + "',"
            + this.options.passwordEncryption + "('" + this.options.adminPassword +"'),"
            + "'ADMIN',"
            + "'" + this.options.adminEmail + "');"; 

        //this.log("Executing: " + cmd);
        //while (!this.spawnCommandSync(mysqlPath, ['-u', this.options.dbUser, '-h', this.options.mysqlHost,'-e', cmd, '-p'+this.options.dbPassword, this.options.dbName])) {
        //    log('Failed.  Try again');
        //}
        
        this.options.installSql += cmd;
        
        
    }
  },
  
  loadInstallSql : function() {
    if (this.installFile && fs.existsSync(this.installFile)) {
        this.options.installSql = this.options.installSql || '';
        var cmd = fs.readFileSync(this.destinationPath(this.installFile), 'utf8');
        //sed -i 's/DEFINER=[^*]*\*/\*/g' mydump.sql
        cmd = cmd.replace(/DEFINER=[^ ]*/g,''); 
        if (cmd) {
            this.options.installSql = cmd + this.options.installSql;
        }
    }
  },
  
  runSQLCommandsAsRoot : function() {
    if (this.options.rootInstallSql) {
        var mysqlPath = this.options.mysql || 'mysql';
        this.log("Preparing to execute SQL commands to create the database and/or user: \n\n" + this.options.rootInstallSql);
        this.log("Please enter the MySQL password for the user "+this.options.mysqlUser+" at the prompt.");
        var cmd = this.options.rootInstallSql;
        var res = this.spawnCommandSync(mysqlPath, ['-u', this.options.mysqlUser, '-h', this.options.mysqlHost, '-p', '-e', cmd]);
        this.log("Result: "+res);
    }
  },
  
  runSQLCommands : function() {
    if (this.options.installSql) {
        var mysqlPath = this.options.mysql || 'mysql';
        this.log("Preparing to execute SQL commands to setup the users table: \n\n" + this.options.installSql);
        this.log("Please enter the MySQL password for the user "+this.options.dbUser+" at the prompt.");
        var cmd = this.options.installSql;
        var res = this.spawnCommandSync(mysqlPath, ['-u', this.options.dbUser, '-h', this.options.mysqlHost,'-e', cmd, '-p', this.options.dbName]);
        this.log("Result: "+res);
    }
  },
  
  showComplete : function() {
      this.log("The app has been successfully created at "+this.destinationPath(this.appname)+"\n\n"
        + "You can now try to load the app in your web browser.  You are also encouraged to take a look at the files that were generated "+
        " to familiarize yourself with the app structure because this is just the beginning of your application.  You will undoubtedly want to "
        + "customize it further.\n"
        + "For more information please see the Xataface website http://xataface.com");
    
   }
  
  
});
