const HeroText = () => {
  return (
    <div className="dark:bg-hero-dark flex min-h-[80vh] justify-center bg-hero bg-cover bg-center bg-no-repeat">
      <div className="container mx-auto grid w-full grid-cols-1 gap-4 p-4 px-4 md:grid-cols-2">
        <div className="flex h-full items-center">
          <div className="w-full space-y-4">
            <h1 className="text-center text-2xl font-bold sm:text-3xl md:text-left md:text-4xl lg:text-5xl">
              Streamline Your <span className="text-primary">Projects</span>,
              Simplify Your Success!
            </h1>
            <p className="text-center text-[12px] sm:text-[16px] md:text-left">
              🛠️ Task Flow simplifies project management by offering intuitive
              tools for tracking tasks, deadlines, and team collaboration—all in
              one platform. Stay organized and boost productivity
              effortlessly.🚀
            </p>
          </div>
        </div>
        {/* <div className="w-full">
          <Image
            src={"/assets/img/hero.png"}
            alt="banner"
            width={400}
            height={300}
            className="h-full w-full"
          />
        </div> */}
      </div>
    </div>
  );
};

export default HeroText;
