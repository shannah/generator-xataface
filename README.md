# Yeoman Generator for Xataface Applications

This project contains a [Yeoman](http://yeoman.io/) generator for a [Xataface](http://www.xataface.com) application.

## Requirements

You must have the following installed and in your environment Path

1. Yeoman
2. MySQL
3. Git

## Usage

~~~~
$ yo xataface myapp
~~~~

Follow the prompts.

This will create your xataface application in a directory "myapp".

You can avoid prompts by providing command-line options.

~~~~
$ yo xataface --help
Usage:
  yo xataface:app [options] <appname>

Options:
  -h,   --help                # Print the generator's options and usage
        --skip-cache          # Do not remember prompt answers                                                                                                                            Default: false
        --skip-install        # Do not automatically install dependencies                                                                                                                 Default: false
        --mysqlHost           # Hostname of MySQL server
        --mysqlUser           # MySQL user to create database.  Usually root.  Only used by this generator.  Not the app.
        --mysqlPassword       # MySQL password to create database. Only used by this generator.  Not the app.
        --dbName              # Database name for app.
        --dbUser              # Database username.  This is the user that the app will connect as.
        --dbPassword          # Database password.  This is the password for the app to connect to the database.
        --tables              # Tables to include in menu.  Format: table1=Label1,table2=Label2, etc...
        --usersTable          # Name of table that stores the app's users if using table-based authentication.
        --passwordColumn      # The column of the users table that stores the password.
        --passwordEncryption  # The encryption type to use for the password column in table-based authentication.  sha1, md5, encrypt, or password
        --usernameColumn      # The column of the users table that stores the username.
        --emailColumn         # The column of the users table that stores the email address.
        --roleColumn          # The column of the users table that stores the role
        --mysqli              # Disable mysqli with --mysql=n
        --mysql               # Absolute path to the mysql CLI executable.  This isn't necessary if mysql is in your environment's PATH.
        --git                 # Absolute path to the git CLI executable.  This isn't necessary if git is in your environment's PATH.
        --createDatabase      # y=Create the database.  Only set this to 'y' if the database doesn't yet exist.
        --createUser          # y=Create the app's mysql user. Only set this to 'y' if the database user doesn't yet exist.
        --createUsersTable    # y=Create the users table in the database automatically.  Only for table-based authenticaton.  Only set this to 'y' if the users table doesn't yet exist.
        --createAdminUser     # y=Insert an admin user for the app into the users table.

Arguments:
  appname    Type: String  Required: true
  
~~~~



