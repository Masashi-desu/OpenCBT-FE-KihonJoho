/* Independently transcribed from QS47-48 after visual review, with ANS1's
 * a=chr&0x0F, b=(&&,||), c=cnt>from, d=pos==WIDTH. Audit-only executable. */
#include <stdio.h>
#include <stdlib.h>
#define WIDTH 60
#define MASKCHR '.'
static void dump(char *filename,long from,long to){
 FILE *infile;int chr,pos=0;long cnt=0;
 char tblC[256],bufC[WIDTH+1],tblH[256],bufH[WIDTH+1],tblL[256],bufL[WIDTH+1];
 char hex[]="0123456789ABCDEF";
 for(chr=0;chr<=0xFF;chr++){
  if((0x20<=chr)&&(chr<=0x7E))tblC[chr]=(char)chr;else tblC[chr]=MASKCHR;
  tblH[chr]=hex[chr>>4];tblL[chr]=hex[chr&0x0F];
 }
 bufC[WIDTH]=bufH[WIDTH]=bufL[WIDTH]='\0';
 infile=fopen(filename,"rb");if(infile==NULL)exit(3);
 while(((chr=fgetc(infile))!=EOF)&&((to<0)||(cnt<=to))){
  cnt++;
  if(cnt>from){
   bufC[pos]=tblC[chr];bufH[pos]=tblH[chr];bufL[pos]=tblL[chr];pos++;
   if(pos==WIDTH){printf("%10ld  %s\n%12s%s\n%12s%s\n\n",cnt-WIDTH,bufC,"",bufH,"",bufL);pos=0;}
  }
 }
 if(pos>0){bufC[pos]=bufH[pos]=bufL[pos]='\0';printf("%10ld  %s\n%12s%s\n%12s%s\n\n",cnt-pos,bufC,"",bufH,"",bufL);}
 if(chr==EOF)printf("END OF DATA ... %ld byte(s)\n",cnt-from);else printf("END OF DUMP ... %ld byte(s)\n",cnt-from);
 fclose(infile);
}
int main(int argc,char **argv){if(argc!=4)return 2;dump(argv[1],strtol(argv[2],NULL,10),strtol(argv[3],NULL,10));return 0;}
