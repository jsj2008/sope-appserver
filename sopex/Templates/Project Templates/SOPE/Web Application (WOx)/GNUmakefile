#
# GNUmakefile
# «PROJECTNAME»
#
# Created by «USERNAME» on «DATE»
#

include $(GNUSTEP_MAKEFILES)/common.make

WOAPP_NAME = «PROJECTNAME»

«PROJECTNAME»_OBJC_FILES =	\
	Application.m		\
	Session.m 		\
	DirectAction.m		\

«PROJECTNAME»_OBJC_FILES +=	\
	Main.m			\

«PROJECTNAME»_OBJC_FILES +=	\
	«PROJECTNAME»_main.m


«PROJECTNAME»_COMPONENTS =	\


«PROJECTNAME»_RESOURCE_FILES =	\


«PROJECTNAME»_LANGUAGES =	\
	English			\


«PROJECTNAME»_LOCALIZED_RESOURCE_FILES	=	\


«PROJECTNAME»_WEBSERVER_RESOURCE_FILES := \
	$(shell find WebServerResources -type f -print)

-include GNUmakefile.preamble
include $(GNUSTEP_MAKEFILES)/woapp.make
-include GNUmakefile.postamble
